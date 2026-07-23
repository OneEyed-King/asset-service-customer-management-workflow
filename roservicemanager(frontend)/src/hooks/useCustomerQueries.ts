import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "@/api/customerApi";
import type { CustomerListParams } from "@/api/customerApi";
import type { CustomerRequest } from "@/types/customer";

/**
 * REACT/TANSTACK QUERY CONCEPT: query keys.
 * TanStack Query caches server data in memory, keyed by an array you
 * choose (like a composite cache key). Two calls with the SAME key share
 * the same cached data; calling `queryClient.invalidateQueries` with a
 * matching key prefix marks that cached data stale and triggers a refetch.
 * Centralizing the key-building logic here avoids typos causing silent
 * cache-miss bugs elsewhere in the app.
 */
export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params: CustomerListParams) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  autocomplete: (query: string) => [...customerKeys.all, "autocomplete", query] as const,
};

export function useCustomersQuery(params: CustomerListParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerApi.list(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCustomerQuery(id: string | undefined) {
  return useQuery({
    queryKey: customerKeys.detail(id ?? ""),
    queryFn: () => customerApi.getById(id as string),
    enabled: !!id,
  });
}

export function useCustomerAutocompleteQuery(query: string) {
  return useQuery({
    queryKey: customerKeys.autocomplete(query),
    queryFn: () => customerApi.autocomplete(query),
    enabled: query.trim().length > 0,
  });
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerRequest) => customerApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CustomerRequest }) => customerApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
    },
  });
}

export function useDeactivateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerApi.deactivate(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
    },
  });
}
