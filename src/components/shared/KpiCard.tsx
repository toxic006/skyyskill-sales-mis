import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "accent" | "info";
  loading?: boolean;
}

const accentMap = {
  primary: "from-primary/15 to-primary-glow/10 text-primary",
  success: "from-success/15 to-success/5 text-success",
  warning: "from-warning/15 to-warning/5 text-warning",
  accent: "from-accent/15 to-accent/5 text-accent",
  info: "from-info/15 to-info/5 text-info",
};

export const KpiCard = ({ label, value, delta, icon: Icon, accent = "primary", loading }: KpiCardProps) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 h-[124px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/60 to-transparent animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
      </div>
    );
  }
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="group rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5 hover:border-primary/30 relative overflow-hidden">
      <div className={cn("absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-50 blur-2xl bg-gradient-to-br", accentMap[accent])} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <div className={cn("h-9 w-9 rounded-xl bg-gradient-to-br grid place-items-center", accentMap[accent])}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {typeof delta === "number" && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            <span className={cn(
              "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-medium",
              positive ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
            )}>
              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(delta).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
};
