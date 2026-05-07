import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  Delivered: "bg-success/12 text-success ring-success/20",
  Shipped: "bg-info/12 text-info ring-info/20",
  Processing: "bg-warning/12 text-warning ring-warning/20",
  Cancelled: "bg-destructive/12 text-destructive ring-destructive/20",
  Paid: "bg-success/12 text-success ring-success/20",
  Pending: "bg-warning/12 text-warning ring-warning/20",
  Refunded: "bg-muted text-muted-foreground ring-border",
  Failed: "bg-destructive/12 text-destructive ring-destructive/20",
  B2C: "bg-primary/10 text-primary ring-primary/20",
  B2B: "bg-accent/10 text-accent ring-accent/20",
  B2G: "bg-primary-glow/15 text-primary-glow ring-primary-glow/20",
};

export const StatusBadge = ({ status }: { status: string }) => (
  <span className={cn(
    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset",
    variants[status] ?? "bg-muted text-muted-foreground ring-border"
  )}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {status}
  </span>
);
