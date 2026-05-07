import { parseISO, isWithinInterval, format, eachDayOfInterval, differenceInDays } from "date-fns";
import { orders, campaigns, kpis as kpiConstants } from "@/data/mock";

export const ANNUAL_TARGET = 25000000; // ₹2.5 Cr period target reference

export interface Range { startDate: Date; endDate: Date }

const inRange = (dateStr: string, r: Range) => {
  const d = parseISO(dateStr);
  return isWithinInterval(d, { start: r.startDate, end: r.endDate });
};

export const filterOrders = (r: Range) => orders.filter((o) => inRange(o.date, r));
export const filterCampaigns = (r: Range) => campaigns.filter((c) => inRange(c.date, r));

export const computeKpis = (r: Range) => {
  const o = filterOrders(r);
  const c = filterCampaigns(r);
  const totalOrders = o.length;
  const revenue = o.reduce((a, x) => a + x.amount, 0);
  const paid = o.filter((x) => x.payment === "Paid").reduce((a, x) => a + x.amount, 0);
  const collectionPct = revenue ? (paid / revenue) * 100 : 0;
  const spend = c.reduce((a, x) => a + x.spend, 0);
  const adRevenue = c.reduce((a, x) => a + x.revenue, 0);
  const roas = spend ? adRevenue / spend : 0;
  const days = Math.max(1, differenceInDays(r.endDate, r.startDate) + 1);
  const targetForPeriod = (ANNUAL_TARGET / 365) * days;
  const targetPct = targetForPeriod ? (revenue / targetForPeriod) * 100 : 0;
  return { totalOrders, revenue, collectionPct, roas, targetPct, spend, adRevenue, paid };
};

export const computeRevenueTrend = (r: Range) => {
  const o = filterOrders(r);
  const days = eachDayOfInterval({ start: r.startDate, end: r.endDate });
  const map = new Map<string, { revenue: number; orders: number }>();
  days.forEach((d) => map.set(format(d, "yyyy-MM-dd"), { revenue: 0, orders: 0 }));
  o.forEach((x) => {
    const cur = map.get(x.date);
    if (cur) { cur.revenue += x.amount; cur.orders += 1; }
  });
  const arr = Array.from(map.entries()).map(([date, v]) => ({
    date: format(parseISO(date), days.length > 45 ? "MMM" : "MMM d"),
    revenue: v.revenue,
    orders: v.orders,
  }));
  // downsample if too many points
  if (arr.length > 60) {
    const step = Math.ceil(arr.length / 60);
    return arr.filter((_, i) => i % step === 0);
  }
  return arr;
};

export const computeOrderStatus = (r: Range) => {
  const o = filterOrders(r);
  const colors: Record<string, string> = {
    Delivered: "hsl(142 71% 45%)",
    Shipped: "hsl(217 91% 60%)",
    Processing: "hsl(38 92% 50%)",
    Cancelled: "hsl(0 84% 60%)",
  };
  const map: Record<string, number> = { Delivered: 0, Shipped: 0, Processing: 0, Cancelled: 0 };
  o.forEach((x) => { map[x.status] = (map[x.status] ?? 0) + 1; });
  return Object.entries(map).map(([name, value]) => ({ name, value, color: colors[name] }));
};

export const KPI_REFERENCE = kpiConstants;
