// Mock API service — simulates network latency and returns derived/typed data.
import * as mock from "@/data/mock";
import {
  computeKpis,
  computeRevenueTrend,
  computeOrderStatus,
  filterOrders,
  filterCampaigns,
  type Range,
} from "@/utils/derive";

const delay = <T>(data: T, ms = 500) => new Promise<T>((res) => setTimeout(() => res(data), ms));

export const api = {
  getKpis: (r: Range) => delay(computeKpis(r), 450),
  getRevenueTrend: (r: Range) => delay(computeRevenueTrend(r), 500),
  getOrderStatus: (r: Range) => delay(computeOrderStatus(r), 400),
  getTopProducts: () => delay(mock.topProducts, 500),
  getOrders: (r: Range) => delay(filterOrders(r), 500),
  getCampaigns: (r: Range) => delay(filterCampaigns(r), 500),
  getIndividualTargets: () => delay(mock.individualTargets, 400),
  getTeamTargets: () => delay(mock.teamTargets, 400),
  getMonthlyVsTarget: () => delay(mock.monthlyVsTarget, 500),
};
