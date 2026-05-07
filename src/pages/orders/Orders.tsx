import { useMemo, useEffect } from "react";
import { useSearchStore } from "@/store/search";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useFilterStore } from "@/store/filters";
import { useOrdersStore } from "@/store/orders";
import { useAuthStore } from "@/store/auth";
import { formatINR } from "@/utils/format";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonBlock } from "@/components/shared/SkeletonBlock";
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import { Search, Download, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";

const PAGE_SIZE = 8;

const Orders = () => {
  const { startDate, endDate } = useFilterStore();
  const ordersQ = useQuery({
    queryKey: ["orders", startDate.toISOString(), endDate.toISOString()],
    queryFn: () => api.getOrders({ startDate, endDate }),
  });

  const role = useAuthStore((s) => s.user?.role);
  const financeFocus = role === "Finance";

  const { search, status, type, payment, page, selectedId,
    setSearch, setStatus, setType, setPayment, setPage, setSelected } = useOrdersStore();

  const globalQuery = useSearchStore((s) => s.query);
  useEffect(() => {
    if (globalQuery !== undefined) setSearch(globalQuery);
  }, [globalQuery, setSearch]);

  const filtered = useMemo(() => {
    const data = ordersQ.data ?? [];
    return data.filter((o) =>
      (status === "all" || o.status === status) &&
      (type === "all" || o.type === type) &&
      (payment === "all" || o.payment === payment) &&
      (search === "" ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase()))
    );
  }, [ordersQ.data, search, status, type, payment]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const selected = filtered.find((o) => o.id === selectedId) ?? ordersQ.data?.find((o) => o.id === selectedId) ?? null;

  const exportCsv = () => {
    try {
      const rows = [
        ["Order ID", "Customer", "Type", "Amount", "GST", "Status", "Payment", "Date"],
        ...filtered.map((o) => [o.id, o.customer, o.type, o.amount, o.gst, o.status, o.payment, o.date]),
      ];
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${filtered.length} orders to CSV`);
    } catch {
      toast.error("Export failed. Please try again.");
    }
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{financeFocus ? "Payments & Orders" : "Orders"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {financeFocus
              ? "Track collections, pending payments and refunds across orders."
              : "Track and manage every order across B2C, B2B, and B2G."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeFilter />
          <button onClick={exportCsv} className="h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary text-sm font-semibold flex items-center gap-2 transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="relative md:col-span-2">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID or customer…"
            maxLength={120}
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-secondary/50 border border-transparent focus:bg-background focus:border-border outline-none text-sm transition"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="B2C">B2C</SelectItem>
            <SelectItem value="B2B">B2B</SelectItem>
            <SelectItem value="B2G">B2G</SelectItem>
          </SelectContent>
        </Select>
        <Select value={payment} onValueChange={setPayment}>
          <SelectTrigger><SelectValue placeholder="Payment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Refunded">Refunded</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {ordersQ.isLoading ? (
          <div className="p-5 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} className="h-12" />)}
          </div>
        ) : paged.length === 0 ? (
          <EmptyState title="No orders found" description="Try adjusting your filters or search query." />
        ) : (
          <div className="overflow-x-auto scrollbar-thin animate-fade-in">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40">
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                  <th className="px-5 py-3 font-medium text-right">GST</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((o) => (
                  <tr key={o.id} onClick={() => setSelected(o.id)} className="border-t border-border hover:bg-secondary/30 cursor-pointer transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold">{o.id}</td>
                    <td className="px-5 py-3.5 font-medium">{o.customer}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.type} /></td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-semibold">{formatINR(o.amount)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-muted-foreground">{formatINR(o.gst)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.payment} /></td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{format(new Date(o.date), "dd MMM yyyy")}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setSelected(o.id); }} className="h-8 w-8 grid place-items-center rounded-md hover:bg-secondary transition-colors">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {paged.length > 0 && (
          <div className="px-5 py-3.5 border-t border-border flex items-center justify-between text-xs">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}</span> of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button disabled={safePage === 1} onClick={() => setPage(safePage - 1)}
                className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="h-4 w-4" /></button>
              <span className="px-3 text-xs font-medium">Page {safePage} of {totalPages}</span>
              <button disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}
                className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Order <span className="font-mono text-sm text-muted-foreground">{selected.id}</span>
                  <StatusBadge status={selected.status} />
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Customer</p>
                  <p className="font-semibold mt-1">{selected.customer}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{selected.type} customer</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Total amount</p>
                  <p className="font-semibold text-lg mt-1">{formatINR(selected.amount)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">incl. GST {formatINR(selected.gst)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Items</p>
                <div className="border border-border rounded-lg overflow-hidden">
                  {selected.items.map((it, i) => (
                    <div key={i} className="px-3 py-2.5 flex items-center justify-between border-b border-border last:border-0 text-sm">
                      <div>
                        <p className="font-medium">{it.name}</p>
                        <p className="text-xs text-muted-foreground">Qty {it.qty} × {formatINR(it.price)}</p>
                      </div>
                      <p className="font-semibold tabular-nums">{formatINR(it.qty * it.price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Payment timeline</p>
                <ol className="relative border-l-2 border-border ml-2 space-y-3">
                  {selected.timeline.map((t, i) => (
                    <li key={i} className="ml-4">
                      <div className="absolute -left-[7px] h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.time}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
