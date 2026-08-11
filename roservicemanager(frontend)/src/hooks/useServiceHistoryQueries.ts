import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceHistoryApi } from "@/api/serviceHistoryApi";
import type { ServiceHistoryListParams } from "@/api/serviceHistoryApi";
import { assetKeys } from "@/hooks/useAssetQueries";
import { dashboardKeys } from "@/hooks/useDashboardQueries";
import type { ServiceHistoryRequest } from "@/types/serviceHistory";

export const serviceHistoryKeys = {
  all: ["serviceHistory"] as const,
  allList: (params: ServiceHistoryListParams) => [...serviceHistoryKeys.all, "all", params] as const,
  byAsset: (assetId: string) => [...serviceHistoryKeys.all, "byAsset", assetId] as const,
  byAssetList: (assetId: string, params: ServiceHistoryListParams) =>
    [...serviceHistoryKeys.byAsset(assetId), params] as const,
  byCustomer: (customerId: string) => [...serviceHistoryKeys.all, "byCustomer", customerId] as const,
  byCustomerList: (customerId: string, params: ServiceHistoryListParams) =>
    [...serviceHistoryKeys.byCustomer(customerId), params] as const,
};

export function useServiceHistoryAllQuery(params: ServiceHistoryListParams) {
  return useQuery({
    queryKey: serviceHistoryKeys.allList(params),
    queryFn: () => serviceHistoryApi.listAll(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useServiceHistoryByAssetQuery(assetId: string | undefined, params: ServiceHistoryListParams) {
  return useQuery({
    queryKey: serviceHistoryKeys.byAssetList(assetId ?? "", params),
    queryFn: () => serviceHistoryApi.listByAsset(assetId as string, params),
    enabled: !!assetId,
    placeholderData: (previousData) => previousData,
  });
}

export function useServiceHistoryByCustomerQuery(customerId: string | undefined, params: ServiceHistoryListParams) {
  return useQuery({
    queryKey: serviceHistoryKeys.byCustomerList(customerId ?? "", params),
    queryFn: () => serviceHistoryApi.listByCustomer(customerId as string, params),
    enabled: !!customerId,
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateServiceHistoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ServiceHistoryRequest) => serviceHistoryApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serviceHistoryKeys.byAsset(data.customerAssetId) });
      queryClient.invalidateQueries({ queryKey: serviceHistoryKeys.all });
      // Creating a service record also advances the asset's own
      // nextServiceDate on the backend - refresh asset lists/details so
      // that shows up without a manual reload.
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
      // The dashboard's counts/lists (overdue, due soon, upcoming,
      // recent activity) are all derived from the same data - keep them
      // in sync so an inline log from the dashboard or Services page
      // shows up immediately without a manual refresh.
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary });
    },
  });
}
