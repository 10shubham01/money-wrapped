import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Global recap view count.
//
// In production this lives in Vercel KV (Upstash Redis) — the Marketplace
// Redis integration provisions KV_REST_API_URL / KV_REST_API_TOKEN (older
// stores expose UPSTASH_REDIS_REST_* — we accept either). When neither is set
// (local dev with no KV configured) we fall back to a small JSON file so the
// counter still works offline.

export const dynamic = "force-dynamic";

const KEY = "mw:views";
const DB_PATH = path.join(process.cwd(), "data", "views.json");

const url =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const token =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

const redis = url && token ? new Redis({ url, token }) : null;

// ── file fallback (local dev) ──────────────────────────────────────────────
async function fileRead(): Promise<number> {
  try {
    const data = JSON.parse(await fs.readFile(DB_PATH, "utf8")) as {
      count?: unknown;
    };
    return typeof data.count === "number" ? data.count : 0;
  } catch {
    return 0;
  }
}

async function fileWrite(count: number): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify({ count }, null, 2), "utf8");
}

// ── handlers ────────────────────────────────────────────────────────────────
export async function GET() {
  const count = redis ? ((await redis.get<number>(KEY)) ?? 0) : await fileRead();
  return NextResponse.json({ count });
}

export async function POST() {
  if (redis) {
    return NextResponse.json({ count: await redis.incr(KEY) });
  }
  const count = (await fileRead()) + 1;
  await fileWrite(count);
  return NextResponse.json({ count });
}
