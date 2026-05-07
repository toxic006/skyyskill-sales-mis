import { useFilterStore, PRESET_LABELS, type DateRangePreset } from "@/store/filters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const presets: DateRangePreset[] = ["thisMonth", "lastMonth", "last7", "last30", "last90", "custom"];

export const DateRangeFilter = ({ className }: { className?: string }) => {
  const { preset, startDate, endDate, setPreset, setCustomRange } = useFilterStore();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={preset} onValueChange={(v) => setPreset(v as DateRangePreset)}>
        <SelectTrigger className="w-[170px] h-10"><SelectValue /></SelectTrigger>
        <SelectContent>
          {presets.map((p) => <SelectItem key={p} value={p}>{PRESET_LABELS[p]}</SelectItem>)}
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-10 font-normal">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {format(startDate, "dd MMM")} – {format(endDate, "dd MMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <Calendar
              mode="range"
              defaultMonth={startDate}
              selected={{ from: startDate, to: endDate }}
              onSelect={(r) => { if (r?.from && r?.to) setCustomRange(r.from, r.to); }}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
