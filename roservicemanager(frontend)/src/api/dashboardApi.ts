import { axiosClient } from "@/api/axiosClient";
import type { DashboardSummary } from "@/types/dashboard";

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await axiosClient.get<DashboardSummary>("/dashboard/summary");
    return response.data;
  },
};
