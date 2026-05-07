import { useMemo, useEffect } from "react";
import { useSearchStore } from "@/store/search";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useFilterStore } from "@/store/filters";
import { useMarketingStore } from "@/store/marketing";
import { formatINR, formatNumber } from "@/utils/format";
import { KpiCard } from "@/components/shared/KpiCard";
import { SkeletonBlock } from "@/components/shared/SkeletonBlock";
import { EmptyState } from "@/components/shared/EmptyState";
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import { Wallet, IndianRupee, TrendingUp, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  LineChart,
} from "recharts";
import { parseISO, format } from "date-fns";

const Marketing = () => {
  const { startDate, endDate } = useFilterStore();
  const q = useQuery({
    queryKey: ["campaigns", startDate.toISOString(), endDate.toISOString()],
    queryFn: () => api.getCampaigns({ startDate, endDate }),
  });

  const { campaign, platform, search, setCampaign, setPlatform, setSearch } = useMarketingStore();

  const globalQuery = useSearchStore((s) => s.query);
  useEffect(() => { setSearch(globalQuery); }, [globalQuery, setSearch]);

  const filtered = useMemo(() =>
    (q.data ?? []).filter((c) =>
      (platform === "all" || c.platform === platform) &&
      (campaign === "all" || c.id === campaign) &&
      (search === "" || c.name.toLowerCase().includes(search.toLowerCase()))
    ),
  [q.data, platform, campaign, search]);

  const totals = useMemo(() => {
    const spend = filtered.reduce((a, c) => a + c.spend, 0);
    const revenue = filtered.reduce((a, c) => a + c.revenue, 0);
    const roas = spend ? revenue / spend : 0;
    return { spend, revenue, roas };
  }, [filtered]);

  const barData = filtered.slice(0, 8).map((c) => ({
    name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
    Spend: c.spend,
    Revenue: c.revenue,
  }));

  const trendData = useMemo(() =>
    [...filtered]
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .map((c) => ({ date: format(parseISO(c.date), "dd MMM"), ROAS: +c.roas.toFixed(2) })),
  [filtered]);

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketing &amp; ROAS</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Performance across all your paid channels.</p>
        </div>
        <DateRangeFilter />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total Spend" value={formatINR(totals.spend, { compact: true })} delta={6.4} icon={Wallet} accent="warning" loading={q.isLoading} />
        <KpiCard label="Total Revenue" value={formatINR(totals.revenue, { compact: true })} delta={22.1} icon={IndianRupee} accent="success" loading={q.isLoading} />
        <KpiCard label="Avg ROAS" value={`${totals.roas.toFixed(2)}x`} delta={11.8} icon={TrendingUp} accent="primary" loading={q.isLoading} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaign…"
            maxLength={120}
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-secondary/50 border border-transparent focus:bg-background focus:border-border outline-none text-sm transition"
          />
        </div>
        <Select value={campaign} onValueChange={setCampaign}>
          <SelectTrigger><SelectValue placeholder="Campaign" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All campaigns</SelectItem>
            {(q.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            <SelectItem value="Meta">Meta</SelectItem>
            <SelectItem value="Google">Google</SelectItem>
            <SelectItem value="Instagram">Instagram</SelectItem>
            <SelectItem value="YouTube">YouTube</SelectItem>
            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-semibold">Spend vs Revenue</p>
          <p className="text-xs text-muted-foreground">Top campaigns in selected period</p>
          {q.isLoading ? (
            <SkeletonBlock className="h-[300px] mt-4" />
          ) : barData.length === 0 ? (
            <EmptyState title="No campaigns" description="No data in selected range." />
          ) : (
            <div className="h-[300px] mt-4 -ml-2 animate-fade-in">
              <ResponsiveContainer>
                <ComposedChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => formatINR(v)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Spend" fill="hsl(var(--warning))" radius={[6, 6, 0, 0]} barSize={18} />
                  <Bar dataKey="Revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={18} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-semibold">ROAS Trend</p>
          <p className="text-xs text-muted-foreground">Return on ad spend over time</p>
          {q.isLoading ? (
            <SkeletonBlock className="h-[300px] mt-4" />
          ) : trendData.length === 0 ? (
            <EmptyState title="No data" description="No campaigns in selected range." />
          ) : (
            <div className="h-[300px] mt-4 -ml-2 animate-fade-in">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}x`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => `${v.toFixed(2)}x`} />
                  <Line type="monotone" dataKey="ROAS" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--accent))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <p className="font-semibold">All campaigns</p>
        </div>
        {q.isLoading ? (
          <div className="p-5 space-y-2">{Array.from({ length: 5 }).map((_, i) => <SkeletonBlock key={i} className="h-12" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No campaigns" description="Try changing filters." />
        ) : (
          <div className="overflow-x-auto scrollbar-thin animate-fade-in">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40">
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Campaign</th>
                  <th className="px-5 py-3 font-medium">Platform</th>
                  <th className="px-5 py-3 font-medium text-right">Spend</th>
                  <th className="px-5 py-3 font-medium text-right">Revenue</th>
                  <th className="px-5 py-3 font-medium text-right">ROAS</th>
                  <th className="px-5 py-3 font-medium text-right">Orders</th>
                  <th className="px-5 py-3 font-medium text-right">CPC</th>
                  <th className="px-5 py-3 font-medium text-right">CTR</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium">{c.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-muted-foreground font-medium">{c.platform}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{formatINR(c.spend)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-semibold">{formatINR(c.revenue)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`tabular-nums font-semibold ${c.roas >= 4 ? "text-success" : c.roas >= 2.5 ? "text-warning" : "text-destructive"}`}>
                        {c.roas.toFixed(2)}x
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{formatNumber(c.orders)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-muted-foreground">₹{c.cpc}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-muted-foreground">{c.ctr}%</td>
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

export default Marketing;
