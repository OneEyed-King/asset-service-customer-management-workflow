import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboardApi";

export const dashboardKeys = {
  summary: ["dashboard", "summary"] as const,
};

export function useDashboardSummaryQuery() {
  return useQuery({
    queryKey: dashboardKeys.summary,
    queryFn: dashboardApi.getSummary,
    // Someone might log a service or add a customer in another tab and
    // come back to this page - a short refetch interval keeps the
    // headline numbers reasonably fresh without hammering the API.
    staleTime: 30_000,
  });
}
