"use client";

import * as pdfjs from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { analyze, type Txn, type WrappedData } from "./analytics";

// Worker resolved by the bundler from the installed package (no CDN / network).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const MONTHS: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

const DATE_RE =
  /(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec), (\d{4})/g;

export function extractTransactions(fullText: string): Txn[] {
  const flat = fullText.replace(/\s+/g, " ");
  const starts: number[] = [];
  let m: RegExpExecArray | null;
  DATE_RE.lastIndex = 0;
  while ((m = DATE_RE.exec(flat))) starts.push(m.index);

  const txns: Txn[] = [];
  for (let i = 0; i < starts.length; i++) {
    const block = flat.slice(starts[i], starts[i + 1] ?? flat.length);

    const dm = block.match(
      /(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec), (\d{4})/,
    );
    const tm = block.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
    const nm = block.match(
      /(Paid to|Received from)\s+([\s\S]+?)\s+(?:\d{1,2}:\d{2}\s*(?:AM|PM)|UPI Transaction ID)/,
    );
    const am = block.match(/₹\s*([\d,]+(?:\.\d+)?)/);
    if (!dm || !nm || !am) continue;

    const day = parseInt(dm[1], 10);
    const month = MONTHS[dm[2]];
    const year = parseInt(dm[3], 10);

    let hour = 12;
    let minute = 0;
    if (tm) {
      hour = parseInt(tm[1], 10) % 12;
      minute = parseInt(tm[2], 10);
      if (tm[3] === "PM") hour += 12;
    }

    const dir = nm[1] === "Paid to" ? "paid" : "received";
    const amount = parseFloat(am[1].replace(/,/g, ""));
    if (!Number.isFinite(amount)) continue;

    const isCredit = /RuPay credit card/.test(block);
    const source: Txn["source"] = isCredit ? "credit" : "other";

    // funding instrument, taken verbatim from "Paid by <bank/card> <last4>"
    // so we never assume which bank/card the user holds.
    let account = "Other account";
    const credit = block.match(/Paid by\s+(.+?\|\s*RuPay credit card)/);
    if (credit) {
      account = credit[1];
    } else {
      const bank = block.match(/Paid by\s+(.+?(?:XX\d{2,6}|\d{3,6}))/);
      if (bank) account = bank[1];
    }
    account = account.replace(/\s+/g, " ").replace(/\s*\|\s*/g, " · ").trim();

    txns.push({
      date: `${dm[1]} ${dm[2]} ${dm[3]}`,
      ts: new Date(year, month, day, hour, minute).getTime(),
      hour,
      name: nm[2].trim(),
      dir,
      amount,
      source,
      account,
    });
  }
  return txns;
}

async function readFullText(file: File): Promise<{ text: string; handle: string }> {
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  let text = "";
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it) => ("str" in it ? (it as TextItem).str : ""))
      .join(" ");
    text += pageText + " ";
  }
  const email = text.match(/([A-Za-z0-9._%+-]+)@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  const handle = email ? email[1] : "you";
  return { text, handle };
}

// Number of calendar months the transactions span, inclusive.
// e.g. 03 Mar → 31 May = 3 months.
function monthSpan(txns: Txn[]): number {
  const sorted = [...txns].sort((a, b) => a.ts - b.ts);
  const first = new Date(sorted[0].ts);
  const last = new Date(sorted[sorted.length - 1].ts);
  return (
    (last.getFullYear() - first.getFullYear()) * 12 +
    (last.getMonth() - first.getMonth()) +
    1
  );
}

export const MIN_MONTHS = 1;
export const MAX_MONTHS = 6;

export async function parseStatement(file: File): Promise<WrappedData> {
  const { text, handle } = await readFullText(file);
  const txns = extractTransactions(text);
  if (txns.length === 0) {
    throw new Error(
      "Couldn't find any transactions. Make sure this is a Google Pay transaction statement PDF.",
    );
  }

  const span = monthSpan(txns);
  if (span < MIN_MONTHS || span > MAX_MONTHS) {
    throw new Error(
      `This statement spans ${span} months. Please upload a Google Pay statement covering ${MIN_MONTHS} to ${MAX_MONTHS} months.`,
    );
  }

  return analyze(txns, handle);
}
