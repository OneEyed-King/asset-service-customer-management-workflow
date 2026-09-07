import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "@/api/paymentApi";
import type { PaymentListParams } from "@/api/paymentApi";
import type { CreatePaymentRequest } from "@/types/payment";

export const paymentKeys = {
  all: ["payments"] as const,
  byCustomer: (customerId: string) => [...paymentKeys.all, "byCustomer", customerId] as const,
  byCustomerList: (customerId: string, params: PaymentListParams) =>
    [...paymentKeys.byCustomer(customerId), params] as const,
  summary: (customerId: string) => [...paymentKeys.all, "summary", customerId] as const,
};

export function usePaymentsByCustomerQuery(customerId: string | undefined, params: PaymentListParams) {
  return useQuery({
    queryKey: paymentKeys.byCustomerList(customerId ?? "", params),
    queryFn: () => paymentApi.listByCustomer(customerId as string, params),
    enabled: !!customerId,
    placeholderData: (previousData) => previousData,
  });
}

export function useCustomerLedgerSummaryQuery(customerId: string | undefined) {
  return useQuery({
    queryKey: paymentKeys.summary(customerId ?? ""),
    queryFn: () => paymentApi.getLedgerSummary(customerId as string),
    enabled: !!customerId,
  });
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaymentRequest) => paymentApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.byCustomer(data.customerId) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.summary(data.customerId) });
    },
  });
}
