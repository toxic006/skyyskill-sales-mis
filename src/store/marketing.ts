import { create } from "zustand";

interface MarketingFilterState {
  campaign: string;
  platform: string;
  search: string;
  setCampaign: (v: string) => void;
  setPlatform: (v: string) => void;
  setSearch: (v: string) => void;
}

export const useMarketingStore = create<MarketingFilterState>((set) => ({
  campaign: "all",
  platform: "all",
  search: "",
  setCampaign: (campaign) => set({ campaign }),
  setPlatform: (platform) => set({ platform }),
  setSearch: (search) => set({ search }),
}));
