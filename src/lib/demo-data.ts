// A 100% fictional demo recap used to play a preview video on the homepage.
// No real statement data is used here — every name, amount and payee below is
// made up purely to showcase what a finished MoneyUnwrapped recap looks like.

import type { WrappedData } from "./analytics";

export const DEMO_WRAPPED: WrappedData = {
  handle: "demo",
  periodLabel: "Mar – May 2026",
  totalSent: 248650,
  totalReceived: 64200,
  net: -184450,
  txnCount: 842,
  paidCount: 820,
  receivedCount: 22,
  activeDays: 88,
  avgPerActiveDay: 2825,
  biggest: { name: "Sunrise Apartments Rent", amount: 18500, dateLabel: "01 Apr 2026" },
  topPayee: { name: "Cuppa Chai Corner", count: 108, total: 3240 },
  topPayees: [
    { name: "Sunrise Apartments Rent", total: 55500, count: 3 },
    { name: "FreshBasket Groceries", total: 28400, count: 21 },
    { name: "Metro Fuel Station", total: 19800, count: 12 },
    { name: "Aarav Sharma", total: 14500, count: 6 },
    { name: "QuickBite Foods", total: 11200, count: 18 },
  ],
  topPayeesByCount: [
    { name: "Cuppa Chai Corner", total: 3240, count: 108 },
    { name: "Metro Auto & Cab", total: 9650, count: 74 },
    { name: "QuickBite Foods", total: 11200, count: 52 },
    { name: "Corner Kirana Store", total: 8900, count: 41 },
    { name: "Aarav Sharma", total: 14500, count: 29 },
  ],
  smallTxnCount: 540,
  smallTxnPct: 66,
  creditSharePct: 34,
  nightOwlPct: 27,
  busiestDay: { label: "18 Apr 2026", count: 21 },
  monthly: [
    { label: "Mar", total: 64200 },
    { label: "Apr", total: 92450 },
    { label: "May", total: 92000 },
  ],
  mostActiveHourLabel: "9 PM",
  hourly: [
    3, 1, 1, 0, 0, 1, 2, 6, 14, 22, 28, 35, 46, 39, 33, 36, 41, 48, 60, 78, 71,
    52, 28, 10,
  ],
  weekdaySpend: 168400,
  weekendSpend: 80250,
  uniquePayees: 142,
  accounts: [
    {
      key: "Demo Savings Account 0001",
      label: "Demo Savings Account 0001",
      total: 164100,
      count: 612,
      pct: 66,
    },
    {
      key: "Demo RuPay credit card 0002",
      label: "Demo RuPay credit card 0002",
      total: 84550,
      count: 208,
      pct: 34,
    },
  ],
  personality: {
    title: "The Chai Economist",
    icon: "coins",
    blurb: "Tiny payments, mighty habit. A few rupees at a time.",
  },
};
