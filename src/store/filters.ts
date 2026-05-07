import { create } from "zustand";
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from "date-fns";

export type DateRangePreset = "thisMonth" | "lastMonth" | "last7" | "last30" | "last90" | "custom";

interface FilterState {
  preset: DateRangePreset;
  startDate: Date;
  endDate: Date;
  setPreset: (p: DateRangePreset) => void;
  setCustomRange: (start: Date, end: Date) => void;
}

const rangeFor = (p: DateRangePreset): { start: Date; end: Date } => {
  const today = new Date();
  switch (p) {
    case "thisMonth":
      return { start: startOfMonth(today), end: endOfMonth(today) };
    case "lastMonth": {
      const lm = subMonths(today, 1);
      return { start: startOfMonth(lm), end: endOfMonth(lm) };
    }
    case "last7":
      return { start: startOfDay(subMonths(today, 0).getTime() - 6 * 86400000 ? new Date(today.getTime() - 6 * 86400000) : today), end: endOfDay(today) };
    case "last30":
      return { start: new Date(today.getTime() - 29 * 86400000), end: endOfDay(today) };
    case "last90":
      return { start: new Date(today.getTime() - 89 * 86400000), end: endOfDay(today) };
    case "custom":
    default:
      return { start: startOfMonth(today), end: endOfMonth(today) };
  }
};

const init = rangeFor("last30");

export const useFilterStore = create<FilterState>((set) => ({
  preset: "last30",
  startDate: init.start,
  endDate: init.end,
  setPreset: (p) => {
    if (p === "custom") return set({ preset: p });
    const r = rangeFor(p);
    set({ preset: p, startDate: r.start, endDate: r.end });
  },
  setCustomRange: (start, end) => set({ preset: "custom", startDate: start, endDate: end }),
}));

export const PRESET_LABELS: Record<DateRangePreset, string> = {
  thisMonth: "This Month",
  lastMonth: "Last Month",
  last7: "Last 7 days",
  last30: "Last 30 days",
  last90: "Last 90 days",
  custom: "Custom",
};
