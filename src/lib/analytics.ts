// Pure, dependency-free analytics for GPay statements.
// Kept free of pdfjs so it can be unit-tested in plain Node.

export type Txn = {
  date: string; // "DD Mon YYYY"
  ts: number; // epoch ms (date + time)
  hour: number; // 0-23
  name: string;
  dir: "paid" | "received";
  amount: number;
  source: "credit" | "other";
  account: string; // funding instrument exactly as printed, e.g. "Kotak Mahindra Bank 5551"
};

export type WrappedData = {
  handle: string; // e.g. "shurugupta19"
  periodLabel: string; // "Mar – May 2026"
  totalSent: number;
  totalReceived: number;
  net: number;
  txnCount: number;
  paidCount: number;
  receivedCount: number;
  activeDays: number;
  avgPerActiveDay: number;
  biggest: { name: string; amount: number; dateLabel: string };
  topPayee: { name: string; count: number; total: number };
  topPayees: { name: string; total: number; count: number }[];
  topPayeesByCount: { name: string; total: number; count: number }[];
  smallTxnCount: number; // < 100
  smallTxnPct: number; // 0-100
  creditSharePct: number; // 0-100 of spend on RuPay credit card
  nightOwlPct: number; // 0-100 of txns 9pm-4am
  busiestDay: { label: string; count: number };
  monthly: { label: string; total: number }[];
  mostActiveHourLabel: string; // e.g. "9 PM"
  hourly: number[]; // 24 buckets, txn counts
  weekdaySpend: number;
  weekendSpend: number;
  uniquePayees: number;
  accounts: {
    key: string;
    label: string;
    total: number;
    count: number;
    pct: number;
  }[];
  personality: { title: string; icon: string; blurb: string };
};

function fmtHour(h: number): string {
  const ampm = h < 12 ? "AM" : "PM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${ampm}`;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

// Title-case a SHOUTED name like "MOHAMMED YUSUF" -> "Mohammed Yusuf"
export function prettyName(raw: string): string {
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Someone";
  // If it has lowercase already, leave as-is (e.g. "Mrinal Singh")
  if (/[a-z]/.test(cleaned)) return cleaned;
  return cleaned
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function dayKey(t: Txn) {
  return t.date;
}

export function analyze(txns: Txn[], handle: string): WrappedData {
  const paid = txns.filter((t) => t.dir === "paid");
  const recv = txns.filter((t) => t.dir === "received");
  const sum = (a: Txn[]) => a.reduce((s, t) => s + t.amount, 0);

  const totalSent = sum(paid);
  const totalReceived = sum(recv);

  // group spend by payee
  const byPayee = new Map<string, { total: number; count: number }>();
  for (const t of paid) {
    const key = prettyName(t.name);
    const e = byPayee.get(key) ?? { total: 0, count: 0 };
    e.total += t.amount;
    e.count += 1;
    byPayee.set(key, e);
  }
  const payeeArr = Array.from(byPayee.entries()).map(([name, v]) => ({
    name,
    ...v,
  }));
  const topPayees = [...payeeArr].sort((a, b) => b.total - a.total).slice(0, 5);
  const topPayeesByCount = [...payeeArr]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const topByCount = [...payeeArr].sort((a, b) => b.count - a.count)[0] ?? {
    name: "—",
    count: 0,
    total: 0,
  };

  // biggest single txn
  const biggestTxn = [...paid].sort((a, b) => b.amount - a.amount)[0];

  // active days + busiest day
  const dayTotals = new Map<string, { count: number; total: number }>();
  for (const t of txns) {
    const e = dayTotals.get(dayKey(t)) ?? { count: 0, total: 0 };
    e.count += 1;
    if (t.dir === "paid") e.total += t.amount;
    dayTotals.set(dayKey(t), e);
  }
  const activeDays = dayTotals.size;
  const busiest = Array.from(dayTotals.entries()).sort(
    (a, b) => b[1].count - a[1].count,
  )[0];

  // monthly spend
  const monthlyMap = new Map<string, number>();
  for (const t of paid) {
    const parts = t.date.split(" "); // DD Mon YYYY
    const mk = `${parts[1]} ${parts[2]}`;
    monthlyMap.set(mk, (monthlyMap.get(mk) ?? 0) + t.amount);
  }
  const monthly = Array.from(monthlyMap.entries())
    .map(([k, total]) => {
      const [mon, yr] = k.split(" "); // "Mon YYYY"
      return {
        label: mon,
        total,
        // chronological across years: e.g. Dec 2025 before Jan 2026
        order: Number(yr) * 12 + MONTHS.indexOf(mon),
      };
    })
    .sort((a, b) => a.order - b.order)
    .map(({ label, total }) => ({ label, total }));

  // period label from min/max date
  const sorted = [...txns].sort((a, b) => a.ts - b.ts);
  const first = sorted[0]?.date.split(" ") ?? ["", "Mar", "2026"];
  const last = sorted[sorted.length - 1]?.date.split(" ") ?? ["", "May", "2026"];
  const [fm, fy] = [first[1], first[2]];
  const [lm, ly] = [last[1], last[2]];
  const periodLabel =
    fy !== ly
      ? `${fm} ${fy} – ${lm} ${ly}`
      : fm === lm
        ? `${fm} ${fy}`
        : `${fm} – ${lm} ${ly}`;

  const smallTxnCount = paid.filter((t) => t.amount < 100).length;
  const smallTxnPct = paid.length
    ? Math.round((smallTxnCount / paid.length) * 100)
    : 0;

  const creditSpend = sum(paid.filter((t) => t.source === "credit"));
  const creditSharePct = totalSent
    ? Math.round((creditSpend / totalSent) * 100)
    : 0;

  const nightTxns = txns.filter((t) => t.hour >= 21 || t.hour < 4).length;
  const nightOwlPct = txns.length
    ? Math.round((nightTxns / txns.length) * 100)
    : 0;

  const avgPerActiveDay = activeDays ? totalSent / activeDays : 0;

  // most active hour-of-day (across all activity)
  const hourly = new Array(24).fill(0) as number[];
  for (const t of txns) hourly[t.hour] += 1;
  let peakHour = 0;
  for (let h = 1; h < 24; h++) if (hourly[h] > hourly[peakHour]) peakHour = h;

  // weekend vs weekday spend (paid only)
  let weekdaySpend = 0;
  let weekendSpend = 0;
  for (const t of paid) {
    const d = new Date(t.ts).getDay(); // 0 Sun .. 6 Sat
    if (d === 0 || d === 6) weekendSpend += t.amount;
    else weekdaySpend += t.amount;
  }

  const uniquePayees = byPayee.size;

  // spend split by funding account, using the names exactly as the statement
  // prints them (e.g. "Kotak Mahindra Bank 5551", "SBM Bank India Ltd XX50 ·
  // RuPay credit card") — we never assume which bank or card the user has.
  const byAccount = new Map<string, { total: number; count: number }>();
  for (const t of paid) {
    const key = t.account || "Other account";
    const e = byAccount.get(key) ?? { total: 0, count: 0 };
    e.total += t.amount;
    e.count += 1;
    byAccount.set(key, e);
  }
  const toAccount = (label: string, total: number, count: number) => ({
    key: label,
    label,
    total,
    count,
    pct: totalSent ? Math.round((total / totalSent) * 100) : 0,
  });
  let accounts = Array.from(byAccount.entries())
    .map(([label, v]) => toAccount(label, v.total, v.count))
    .sort((a, b) => b.total - a.total);
  // keep the chart readable: top 4 accounts, rest merged into "Other accounts"
  if (accounts.length > 5) {
    const head = accounts.slice(0, 4);
    const tail = accounts.slice(4);
    head.push(
      toAccount(
        "Other accounts",
        tail.reduce((s, a) => s + a.total, 0),
        tail.reduce((s, a) => s + a.count, 0),
      ),
    );
    accounts = head;
  }

  const personality = derivePersonality({
    smallTxnPct,
    creditSharePct,
    nightOwlPct,
    topShare: totalSent ? topByCount.total / totalSent : 0,
    txnPerDay: activeDays ? txns.length / activeDays : 0,
    netPositive: totalReceived > totalSent,
  });

  return {
    handle,
    periodLabel,
    totalSent,
    totalReceived,
    net: totalReceived - totalSent,
    txnCount: txns.length,
    paidCount: paid.length,
    receivedCount: recv.length,
    activeDays,
    avgPerActiveDay,
    biggest: biggestTxn
      ? {
          name: prettyName(biggestTxn.name),
          amount: biggestTxn.amount,
          dateLabel: biggestTxn.date,
        }
      : { name: "—", amount: 0, dateLabel: "" },
    topPayee: {
      name: topByCount.name,
      count: topByCount.count,
      total: topByCount.total,
    },
    topPayees,
    topPayeesByCount,
    smallTxnCount,
    smallTxnPct,
    creditSharePct,
    nightOwlPct,
    busiestDay: busiest
      ? { label: busiest[0], count: busiest[1].count }
      : { label: "—", count: 0 },
    monthly,
    mostActiveHourLabel: fmtHour(peakHour),
    hourly,
    weekdaySpend,
    weekendSpend,
    uniquePayees,
    accounts,
    personality,
  };
}

function derivePersonality(s: {
  smallTxnPct: number;
  creditSharePct: number;
  nightOwlPct: number;
  topShare: number;
  txnPerDay: number;
  netPositive: boolean;
}): { title: string; icon: string; blurb: string } {
  if (s.txnPerDay >= 8)
    return {
      title: "The Tap-Tap Champion",
      icon: "bolt",
      blurb: "Your thumb deserves its own bank account.",
    };
  if (s.creditSharePct >= 50)
    return {
      title: "The Points Hunter",
      icon: "card",
      blurb: "Why pay with cash when rewards exist?",
    };
  if (s.smallTxnPct >= 60)
    return {
      title: "The Chai Economist",
      icon: "coins",
      blurb: "Tiny payments, mighty habit. A few rupees at a time.",
    };
  if (s.nightOwlPct >= 30)
    return {
      title: "The Midnight Spender",
      icon: "moon",
      blurb: "The best deals happen after dark, apparently.",
    };
  if (s.topShare >= 0.4)
    return {
      title: "The Loyal Regular",
      icon: "heart",
      blurb: "You found your people and you pay them. Often.",
    };
  return {
    title: "The Balanced Baller",
    icon: "balance",
    blurb: "A little here, a little there. Smooth operator.",
  };
}

// Formatting helpers re-exported for the video components
export const formatINR = inr;
export function formatCompactINR(n: number): string {
  if (n >= 1e7) return "₹" + (n / 1e7).toFixed(2).replace(/\.?0+$/, "") + "Cr";
  if (n >= 1e5) return "₹" + (n / 1e5).toFixed(2).replace(/\.?0+$/, "") + "L";
  if (n >= 1e3) return "₹" + (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return "₹" + Math.round(n);
}
