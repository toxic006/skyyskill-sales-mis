import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useFilterStore } from "@/store/filters";
import { useSearchStore } from "@/store/search";
import { KpiCard } from "@/components/shared/KpiCard";
import { SkeletonBlock } from "@/components/shared/SkeletonBlock";
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatINR, formatNumber, formatPct } from "@/utils/format";
import { ShoppingBag, IndianRupee, Wallet, TrendingUp, Target as TargetIcon, ArrowUpRight } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { toast } from "sonner";

const Dashboard = () => {
  const user = useAuthStore((s) => s.user);
  const { startDate, endDate } = useFilterStore();
  const query = useSearchStore((s) => s.query).trim().toLowerCase();
  const range = { startDate, endDate };
  const key = [startDate.toISOString(), endDate.toISOString()];

  const kpisQ = useQuery({ queryKey: ["kpis", ...key], queryFn: () => api.getKpis(range) });
  const trendQ = useQuery({ queryKey: ["trend", ...key], queryFn: () => api.getRevenueTrend(range) });
  const statusQ = useQuery({ queryKey: ["status", ...key], queryFn: () => api.getOrderStatus(range) });
  const productsQ = useQuery({ queryKey: ["products"], queryFn: api.getTopProducts });

  const totalStatus = statusQ.data?.reduce((a, x) => a + x.value, 0) ?? 0;

  const filteredProducts = useMemo(() => {
    if (!productsQ.data) return [];
    if (!query) return productsQ.data;
    return productsQ.data.filter(
      (p) => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
    );
  }, [productsQ.data, query]);

  const exportSnapshot = () => {
    try {
      const lines: string[] = [];
      lines.push("SkyySkill Sales MIS — Dashboard Snapshot");
      lines.push(`Generated: ${new Date().toLocaleString("en-IN")}`);
      lines.push(`Range: ${startDate.toDateString()} → ${endDate.toDateString()}`);
      lines.push("");
      lines.push("KPI,Value");
      const k = kpisQ.data;
      if (k) {
        lines.push(`Total Orders,${k.totalOrders}`);
        lines.push(`Revenue (INR),${k.revenue}`);
        lines.push(`Collection %,${k.collectionPct}`);
        lines.push(`ROAS,${k.roas}`);
        lines.push(`Target Achievement %,${k.targetPct}`);
      }
      lines.push("");
      lines.push("Top Products");
      lines.push("Name,Category,Units,Revenue,Growth%");
      filteredProducts.forEach((p) =>
        lines.push(`"${p.name}","${p.category}",${p.units},${p.revenue},${p.growth}`)
      );
      const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `skyyskill-dashboard-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Dashboard snapshot downloaded");
    } catch {
      toast.error("Export failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
            Welcome back, {user?.name?.split(" ")[0] ?? "there"} <span className="inline-block animate-pulse">👋</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangeFilter />
          <button
            onClick={exportSnapshot}
            className="h-10 px-4 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-95 hover:shadow-glow transition-all flex items-center gap-1.5"
          >
            Export <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 transition-all">
        <KpiCard label="Total Orders" value={formatNumber(kpisQ.data?.totalOrders ?? 0)} delta={12.4} icon={ShoppingBag} accent="primary" loading={kpisQ.isLoading} />
        <KpiCard label="Revenue" value={formatINR(kpisQ.data?.revenue ?? 0, { compact: true })} delta={18.7} icon={IndianRupee} accent="success" loading={kpisQ.isLoading} />
        <KpiCard label="Collection %" value={formatPct(kpisQ.data?.collectionPct ?? 0)} delta={-2.1} icon={Wallet} accent="warning" loading={kpisQ.isLoading} />
        <KpiCard label="ROAS" value={`${(kpisQ.data?.roas ?? 0).toFixed(2)}x`} delta={8.3} icon={TrendingUp} accent="accent" loading={kpisQ.isLoading} />
        <KpiCard label="Target Achievement" value={formatPct(kpisQ.data?.targetPct ?? 0)} delta={5.6} icon={TargetIcon} accent="info" loading={kpisQ.isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="font-semibold">Revenue Trend</p>
              <p className="text-xs text-muted-foreground">Performance for the selected period</p>
            </div>
            <div className="flex gap-1.5 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary"><span className="h-2 w-2 rounded-full bg-primary" /> Revenue</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary"><span className="h-2 w-2 rounded-full bg-accent" /> Orders</span>
            </div>
          </div>
          {trendQ.isLoading ? (
            <SkeletonBlock className="h-[300px] mt-4" />
          ) : !trendQ.data || trendQ.data.every((d) => d.revenue === 0) ? (
            <EmptyState title="No revenue in range" description="Try a different date range." />
          ) : (
            <div className="h-[300px] mt-4 -ml-2 animate-fade-in">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendQ.data}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ord" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} interval={Math.max(0, Math.floor((trendQ.data?.length ?? 0) / 8))} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number, name) => name === "revenue" ? formatINR(v) : formatNumber(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#rev)" />
                  <Area type="monotone" dataKey="orders" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#ord)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-semibold">Order Status</p>
          <p className="text-xs text-muted-foreground">Distribution this period</p>
          {statusQ.isLoading ? (
            <SkeletonBlock className="h-[300px] mt-4" />
          ) : totalStatus === 0 ? (
            <EmptyState title="No orders" description="No orders in this period." />
          ) : (
            <div className="animate-fade-in">
              <div className="h-[220px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusQ.data} dataKey="value" innerRadius={58} outerRadius={88} paddingAngle={3} stroke="none">
                      {statusQ.data?.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {statusQ.data?.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="ml-auto font-semibold">{formatNumber(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <p className="font-semibold">Top Performing Products</p>
            <p className="text-xs text-muted-foreground">Best sellers across all categories</p>
          </div>
        </div>
        {productsQ.isLoading ? (
          <div className="p-5 space-y-2"><SkeletonBlock className="h-12" /><SkeletonBlock className="h-12" /><SkeletonBlock className="h-12" /></div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40">
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium text-right">Units sold</th>
                  <th className="px-5 py-3 font-medium text-right">Revenue</th>
                  <th className="px-5 py-3 font-medium text-right">Growth</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.name} className="border-t border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium">{p.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{p.category}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{formatNumber(p.units)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-semibold">{formatINR(p.revenue, { compact: true })}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${p.growth >= 0 ? "text-success bg-success/10" : "text-destructive bg-destructive/10"}`}>
                        {p.growth >= 0 ? "↑" : "↓"} {Math.abs(p.growth)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
