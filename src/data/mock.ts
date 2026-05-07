import { subDays, format } from "date-fns";

// ----- KPIs -----
export const kpis = {
  totalOrders: 12847,
  revenue: 18452000,
  collectionPct: 87.4,
  roas: 4.32,
  targetPct: 78.6,
};

// ----- Revenue trend (30 days) -----
export const revenueTrend = Array.from({ length: 30 }).map((_, i) => {
  const date = subDays(new Date(), 29 - i);
  const base = 450000 + Math.sin(i / 3) * 80000 + i * 4200;
  const noise = (Math.random() - 0.5) * 60000;
  return {
    date: format(date, "MMM d"),
    revenue: Math.max(180000, Math.round(base + noise)),
    orders: Math.round(280 + Math.sin(i / 4) * 60 + Math.random() * 40),
  };
});

// ----- Order status -----
export const orderStatusData = [
  { name: "Delivered", value: 7842, color: "hsl(142 71% 45%)" },
  { name: "Shipped", value: 2156, color: "hsl(217 91% 60%)" },
  { name: "Processing", value: 1483, color: "hsl(38 92% 50%)" },
  { name: "Cancelled", value: 1366, color: "hsl(0 84% 60%)" },
];

// ----- Top products -----
export const topProducts = [
  { name: "Aether Pro Wireless Earbuds", category: "Electronics", units: 1842, revenue: 5526000, growth: 24.5 },
  { name: "Lumière Smart Lamp", category: "Home", units: 1256, revenue: 2261000, growth: 18.2 },
  { name: "Nimbus Yoga Mat Premium", category: "Fitness", units: 982, revenue: 1473000, growth: -4.1 },
  { name: "Cedar & Sage Candle Set", category: "Lifestyle", units: 1547, revenue: 1238000, growth: 11.7 },
  { name: "Orion Mechanical Keyboard", category: "Electronics", units: 612, revenue: 4284000, growth: 32.8 },
];

// ----- Orders -----
const customers = [
  "Aarav Sharma", "Priya Iyer", "Rohan Mehta", "Anika Reddy", "Vihaan Kapoor",
  "Diya Joshi", "Arjun Nair", "Saanvi Patel", "Kabir Singh", "Ishaan Verma",
  "Meera Desai", "Aditya Rao", "Riya Banerjee", "Vivaan Gupta", "Aanya Malhotra",
];
const types = ["B2C", "B2B", "B2G"] as const;
const statuses = ["Delivered", "Shipped", "Processing", "Cancelled"] as const;
const payments = ["Paid", "Pending", "Refunded", "Failed"] as const;

export const orders = Array.from({ length: 64 }).map((_, i) => {
  const amount = Math.round(2400 + Math.random() * 84000);
  const gst = Math.round(amount * 0.18);
  return {
    id: `NX-${(102847 + i).toString()}`,
    customer: customers[i % customers.length],
    type: types[i % types.length],
    amount,
    gst,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    payment: payments[Math.floor(Math.random() * payments.length)],
    date: format(subDays(new Date(), Math.floor(Math.random() * 60)), "yyyy-MM-dd"),
    items: [
      { name: "Aether Pro Wireless Earbuds", qty: 1 + (i % 3), price: 2999 },
      { name: "Cedar & Sage Candle Set", qty: 1 + (i % 2), price: 799 },
    ],
    timeline: [
      { label: "Order placed", time: "10:32 AM" },
      { label: "Payment confirmed", time: "10:34 AM" },
      { label: "Dispatched from warehouse", time: "Next day, 2:18 PM" },
    ],
  };
});

// ----- Marketing campaigns -----
const platforms = ["Meta", "Google", "Instagram", "YouTube", "LinkedIn"];
export const campaigns = Array.from({ length: 14 }).map((_, i) => {
  const spend = Math.round(40000 + Math.random() * 320000);
  const roas = +(2.4 + Math.random() * 4).toFixed(2);
  const revenue = Math.round(spend * roas);
  return {
    id: `CMP-${100 + i}`,
    name: [
      "Diwali Mega Sale", "Republic Day Push", "Brand Awareness Q2", "Retargeting Cart",
      "Festive Fashion", "B2B Lead Gen", "Holi Splash", "Wedding Edit",
      "Monsoon Essentials", "Back to Office", "Tech Tuesday", "Fitness Sprint",
      "New Year Hype", "Summer Skincare",
    ][i],
    platform: platforms[i % platforms.length],
    spend,
    revenue,
    roas,
    orders: Math.round(80 + Math.random() * 600),
    cpc: +(8 + Math.random() * 22).toFixed(2),
    ctr: +(0.8 + Math.random() * 4.2).toFixed(2),
    date: format(subDays(new Date(), i * 3), "yyyy-MM-dd"),
  };
});

// ----- Targets -----
export const individualTargets = [
  { name: "Aarav Sharma", role: "Sales Lead", target: 2500000, achieved: 2150000 },
  { name: "Priya Iyer", role: "Account Exec", target: 1800000, achieved: 1845000 },
  { name: "Rohan Mehta", role: "BD Manager", target: 2200000, achieved: 1342000 },
  { name: "Anika Reddy", role: "Sales Exec", target: 1500000, achieved: 1190000 },
  { name: "Vihaan Kapoor", role: "Key Accounts", target: 3000000, achieved: 2840000 },
];

export const teamTargets = [
  { team: "Enterprise", target: 12000000, achieved: 9840000 },
  { team: "SMB", target: 8000000, achieved: 7250000 },
  { team: "Retail", target: 6000000, achieved: 6420000 },
];

export const monthlyVsTarget = [
  { month: "Jan", target: 6000000, actual: 5240000 },
  { month: "Feb", target: 6200000, actual: 5980000 },
  { month: "Mar", target: 6500000, actual: 7120000 },
  { month: "Apr", target: 6800000, actual: 6240000 },
  { month: "May", target: 7000000, actual: 7820000 },
  { month: "Jun", target: 7200000, actual: 6680000 },
  { month: "Jul", target: 7500000, actual: 7340000 },
  { month: "Aug", target: 7800000, actual: 8120000 },
  { month: "Sep", target: 8000000, actual: 7560000 },
];
