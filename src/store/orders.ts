import { create } from "zustand";

export interface OrdersFilterState {
  search: string;
  status: string;
  type: string;
  payment: string;
  page: number;
  selectedId: string | null;
  setSearch: (v: string) => void;
  setStatus: (v: string) => void;
  setType: (v: string) => void;
  setPayment: (v: string) => void;
  setPage: (v: number) => void;
  setSelected: (id: string | null) => void;
  reset: () => void;
}

export const useOrdersStore = create<OrdersFilterState>((set) => ({
  search: "",
  status: "all",
  type: "all",
  payment: "all",
  page: 1,
  selectedId: null,
  setSearch: (v) => set({ search: v, page: 1 }),
  setStatus: (v) => set({ status: v, page: 1 }),
  setType: (v) => set({ type: v, page: 1 }),
  setPayment: (v) => set({ payment: v, page: 1 }),
  setPage: (page) => set({ page }),
  setSelected: (selectedId) => set({ selectedId }),
  reset: () => set({ search: "", status: "all", type: "all", payment: "all", page: 1 }),
}));
