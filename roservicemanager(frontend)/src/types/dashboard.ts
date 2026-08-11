import type { ServiceHistoryEntry } from "@/types/serviceHistory";

/**
 * Matches backend UpcomingServiceDto exactly. One row in the "due/overdue"
 * list - an under-AMC asset with a next service date.
 */
export interface UpcomingService {
  customerAssetId: string;
  assetName: string;
  customerId: string;
  customerName: string;
  nextServiceDate: string;
  overdue: boolean;
  serviceIntervalDays: number | null;
}

/**
 * Matches backend DashboardSummaryDto exactly.
 */
export interface DashboardSummary {
  totalCustomers: number;
  totalAssets: number;
  assetsUnderAmc: number;
  overdueServiceCount: number;
  dueSoonServiceCount: number;
  upcomingServices: UpcomingService[];
  recentActivity: ServiceHistoryEntry[];
}
