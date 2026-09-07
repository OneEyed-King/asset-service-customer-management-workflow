import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { amcApi } from "@/api/amcApi";
import type { AmcContractListParams } from "@/api/amcApi";
import type { CreateAmcContractRequest } from "@/types/amc";

export const amcKeys = {
  all: ["amcContracts"] as const,
  byAsset: (assetId: string) => [...amcKeys.all, "byAsset", assetId] as const,
  byAssetList: (assetId: string, params: AmcContractListParams) =>
    [...amcKeys.byAsset(assetId), params] as const,
  byCustomer: (customerId: string) => [...amcKeys.all, "byCustomer", customerId] as const,
  byCustomerList: (customerId: string, params: AmcContractListParams) =>
    [...amcKeys.byCustomer(customerId), params] as const,
};

export function useAmcContractsByAssetQuery(assetId: string | undefined, params: AmcContractListParams) {
  return useQuery({
    queryKey: amcKeys.byAssetList(assetId ?? "", params),
    queryFn: () => amcApi.listByAsset(assetId as string, params),
    enabled: !!assetId,
    placeholderData: (previousData) => previousData,
  });
}

export function useAmcContractsByCustomerQuery(customerId: string | undefined, params: AmcContractListParams) {
  return useQuery({
    queryKey: amcKeys.byCustomerList(customerId ?? "", params),
    queryFn: () => amcApi.listByCustomer(customerId as string, params),
    enabled: !!customerId,
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateAmcContractMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAmcContractRequest) => amcApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: amcKeys.byAsset(data.customerAssetId) });
      queryClient.invalidateQueries({ queryKey: amcKeys.byCustomer(data.customerId) });
    },
  });
}

export function useCancelAmcContractMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => amcApi.cancel(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: amcKeys.byAsset(data.customerAssetId) });
      queryClient.invalidateQueries({ queryKey: amcKeys.byCustomer(data.customerId) });
    },
  });
}
