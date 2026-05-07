import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { formatINR } from "@/utils/format";
import { SkeletonBlock } from "@/components/shared/SkeletonBlock";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const ProgressBar = ({ pct }: { pct: number }) => {
  const color = pct >= 100 ? "bg-success" : pct >= 75 ? "bg-primary" : pct >= 50 ? "bg-warning" : "bg-destructive";
  return (
    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-700 ease-smooth", color)} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
};

const Targets = () => {
  const indQ = useQuery({ queryKey: ["ind-targets"], queryFn: api.getIndividualTargets });
  const teamQ = useQuery({ queryKey: ["team-targets"], queryFn: api.getTeamTargets });
  const monthlyQ = useQuery({ queryKey: ["monthly-target"], queryFn: api.getMonthlyVsTarget });

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Targets & Performance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">How individuals and teams are tracking against goals.</p>
      </div>

      {/* Individual + Team grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Individual */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">Individual Targets</p>
              <p className="text-xs text-muted-foreground">Sales team performance this quarter</p>
            </div>
          </div>
          {indQ.isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-4">
              {indQ.data?.map((p) => {
                const pct = (p.achieved / p.target) * 100;
                return (
                  <div key={p.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg gradient-primary text-primary-foreground grid place-items-center text-xs font-bold">
                          {p.name.split(" ").map(s => s[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-sm font-bold tabular-nums", pct >= 100 ? "text-success" : "text-foreground")}>{pct.toFixed(0)}%</p>
                        <p className="text-[11px] text-muted-foreground tabular-nums">{formatINR(p.achieved, { compact: true })} / {formatINR(p.target, { compact: true })}</p>
                      </div>
                    </div>
                    <ProgressBar pct={pct} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Team */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">Team Targets</p>
              <p className="text-xs text-muted-foreground">Department-level achievement</p>
            </div>
          </div>
          {teamQ.isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-20" />)}</div>
          ) : (
            <div className="space-y-4">
              {teamQ.data?.map((t) => {
                const pct = (t.achieved / t.target) * 100;
                return (
                  <div key={t.team} className="rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{t.team} Team</p>
                        <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                          {formatINR(t.achieved, { compact: true })} of {formatINR(t.target, { compact: true })}
                        </p>
                      </div>
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-bold tabular-nums",
                        pct >= 100 ? "bg-success/15 text-success" : pct >= 75 ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"
                      )}>{pct.toFixed(0)}%</span>
                    </div>
                    <ProgressBar pct={pct} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Monthly vs Target chart */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="font-semibold">Monthly Performance vs Target</p>
        <p className="text-xs text-muted-foreground">Year-to-date comparison</p>
        {monthlyQ.isLoading ? (
          <SkeletonBlock className="h-[320px] mt-4" />
        ) : (
          <div className="h-[340px] mt-4 -ml-2">
            <ResponsiveContainer>
              <BarChart data={monthlyQ.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => formatINR(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="target" fill="hsl(var(--muted))" radius={[6, 6, 0, 0]} barSize={22} />
                <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Targets;
