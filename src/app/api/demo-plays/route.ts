import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Global demo-video play count — an internal metric (not surfaced on the
// frontend). Incremented when a visitor plays the homepage demo recap, so the
// owner can see how many people watched it. To read it: GET this route.
//
// Storage mirrors the recap-view counter: Vercel KV (Upstash Redis) in
// production, with a JSON-file fallback for local dev when no KV is configured.

export const dynamic = "force-dynamic";

const KEY = "mw:demo_plays";
const DB_PATH = path.join(process.cwd(), "data", "demo-plays.json");

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
