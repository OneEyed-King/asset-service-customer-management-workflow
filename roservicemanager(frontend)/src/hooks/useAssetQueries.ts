import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assetApi } from "@/api/assetApi";
import type { AssetListParams } from "@/api/assetApi";
import type { CustomerAssetRequest } from "@/types/asset";

export const assetKeys = {
  all: ["assets"] as const,
  lists: () => [...assetKeys.all, "list"] as const,
  list: (params: AssetListParams) => [...assetKeys.lists(), params] as const,
  due: () => [...assetKeys.all, "due"] as const,
  dueList: (params: AssetListParams) => [...assetKeys.due(), params] as const,
  byCustomer: (customerId: string) => [...assetKeys.all, "byCustomer", customerId] as const,
  byCustomerList: (customerId: string, params: AssetListParams) =>
    [...assetKeys.byCustomer(customerId), params] as const,
  details: () => [...assetKeys.all, "detail"] as const,
  detail: (id: string) => [...assetKeys.details(), id] as const,
};

export function useAssetsQuery(params: AssetListParams) {
  return useQuery({
    queryKey: assetKeys.list(params),
    queryFn: () => assetApi.list(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useDueAssetsQuery(params: AssetListParams) {
  return useQuery({
    queryKey: assetKeys.dueList(params),
    queryFn: () => assetApi.listDue(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAssetsByCustomerQuery(customerId: string | undefined, params: AssetListParams) {
  return useQuery({
    queryKey: assetKeys.byCustomerList(customerId ?? "", params),
    queryFn: () => assetApi.listByCustomer(customerId as string, params),
    enabled: !!customerId,
    placeholderData: (previousData) => previousData,
  });
}

export function useAssetQuery(id: string | undefined) {
  return useQuery({
    queryKey: assetKeys.detail(id ?? ""),
    queryFn: () => assetApi.getById(id as string),
    enabled: !!id,
  });
}

function invalidateAssetData(queryClient: ReturnType<typeof useQueryClient>, customerId?: string) {
  queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
  queryClient.invalidateQueries({ queryKey: assetKeys.due() });
  if (customerId) {
    queryClient.invalidateQueries({ queryKey: assetKeys.byCustomer(customerId) });
  }
}

export function useCreateAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerAssetRequest) => assetApi.create(payload),
    onSuccess: (data) => invalidateAssetData(queryClient, data.customerId),
  });
}

export function useUpdateAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CustomerAssetRequest }) => assetApi.update(id, payload),
    onSuccess: (data, variables) => {
      invalidateAssetData(queryClient, data.customerId);
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(variables.id) });
    },
  });
}

export function useDeactivateAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; customerId?: string }) => assetApi.deactivate(id),
    onSuccess: (_data, variables) => {
      invalidateAssetData(queryClient, variables.customerId);
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(variables.id) });
    },
  });
}
