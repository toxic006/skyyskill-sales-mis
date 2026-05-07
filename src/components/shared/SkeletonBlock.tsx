import { cn } from "@/lib/utils";

export const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={cn("relative overflow-hidden rounded-lg bg-secondary/60", className)}>
    <div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent animate-shimmer"
      style={{ backgroundSize: "200% 100%" }}
    />
  </div>
);
