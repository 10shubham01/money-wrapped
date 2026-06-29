import { z } from "zod";

export const COMP_NAME = "MyComp";

// --- Schema mirrors WrappedData from src/lib/analytics.ts -------------------
const Payee = z.object({
  name: z.string(),
  total: z.number(),
  count: z.number(),
});

export const CompositionProps = z.object({
  handle: z.string(),
  periodLabel: z.string(),
  totalSent: z.number(),
  totalReceived: z.number(),
  net: z.number(),
  txnCount: z.number(),
  paidCount: z.number(),
  receivedCount: z.number(),
  activeDays: z.number(),
  avgPerActiveDay: z.number(),
  biggest: z.object({
    name: z.string(),
    amount: z.number(),
    dateLabel: z.string(),
  }),
  topPayee: z.object({
    name: z.string(),
    count: z.number(),
    total: z.number(),
  }),
  topPayees: z.array(Payee),
  topPayeesByCount: z.array(Payee),
  smallTxnCount: z.number(),
  smallTxnPct: z.number(),
  creditSharePct: z.number(),
  nightOwlPct: z.number(),
  busiestDay: z.object({ label: z.string(), count: z.number() }),
  monthly: z.array(z.object({ label: z.string(), total: z.number() })),
  mostActiveHourLabel: z.string(),
  hourly: z.array(z.number()),
  weekdaySpend: z.number(),
  weekendSpend: z.number(),
  uniquePayees: z.number(),
  accounts: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      total: z.number(),
      count: z.number(),
      pct: z.number(),
    }),
  ),
  personality: z.object({
    title: z.string(),
    icon: z.string(),
    blurb: z.string(),
  }),
});

// A real, fun default so the Studio / first paint shows a populated video.
export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  handle: "you",
  periodLabel: "Mar – May 2026",
  totalSent: 364878,
  totalReceived: 85079,
  net: -279799,
  txnCount: 1119,
  paidCount: 1099,
  receivedCount: 20,
  activeDays: 90,
  avgPerActiveDay: 4054,
  biggest: { name: "Ruchee Kumari", amount: 21000, dateLabel: "30 May 2026" },
  topPayee: { name: "Mohammed Yusuf", count: 124, total: 2466 },
  topPayees: [
    { name: "Mutual Funds Iccl", total: 35000, count: 3 },
    { name: "Tusshar Sankhe", total: 31000, count: 4 },
    { name: "Ruchee Kumari", total: 27200, count: 3 },
    { name: "Mrinal Singh", total: 20729, count: 2 },
    { name: "Kiran Yadav", total: 16000, count: 3 },
  ],
  topPayeesByCount: [
    { name: "Mohammed Yusuf", total: 2466, count: 124 },
    { name: "Md Sajjad Ali", total: 5210, count: 96 },
    { name: "Saroj Sahu", total: 8740, count: 71 },
    { name: "Rita General Store", total: 12300, count: 54 },
    { name: "Mrinal Singh", total: 20729, count: 38 },
  ],
  smallTxnCount: 726,
  smallTxnPct: 66,
  creditSharePct: 30,
  nightOwlPct: 25,
  busiestDay: { label: "19 Apr 2026", count: 25 },
  monthly: [
    { label: "Mar", total: 70732 },
    { label: "Apr", total: 107315 },
    { label: "May", total: 186830 },
  ],
  mostActiveHourLabel: "9 PM",
  hourly: [
    4, 2, 1, 0, 0, 1, 3, 8, 18, 26, 31, 40, 52, 44, 38, 41, 47, 55, 68, 92, 84,
    61, 33, 12,
  ],
  weekdaySpend: 248000,
  weekendSpend: 116878,
  uniquePayees: 187,
  accounts: [
    {
      key: "Kotak Mahindra Bank 5551",
      label: "Kotak Mahindra Bank 5551",
      total: 255415,
      count: 849,
      pct: 70,
    },
    {
      key: "SBM Bank India Ltd XX50 · RuPay credit card",
      label: "SBM Bank India Ltd XX50 · RuPay credit card",
      total: 109463,
      count: 250,
      pct: 30,
    },
  ],
  personality: {
    title: "The Tap-Tap Champion",
    icon: "bolt",
    blurb: "Your thumb deserves its own bank account.",
  },
};

export const VIDEO_FPS = 30;
export const DURATION_IN_FRAMES = 60 * VIDEO_FPS; // 60s
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
