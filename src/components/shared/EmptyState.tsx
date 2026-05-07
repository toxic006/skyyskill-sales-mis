import { Inbox } from "lucide-react";

export const EmptyState = ({ title = "No data", description = "Try adjusting your filters." }: { title?: string; description?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="h-14 w-14 rounded-2xl bg-secondary grid place-items-center mb-3">
      <Inbox className="h-6 w-6 text-muted-foreground" />
    </div>
    <p className="font-semibold">{title}</p>
    <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
  </div>
);
