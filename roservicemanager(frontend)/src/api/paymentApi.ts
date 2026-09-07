import { axiosClient } from "@/api/axiosClient";
import type { PageResponse } from "@/types/api";
import type { CreatePaymentRequest, CustomerLedgerSummary, Payment } from "@/types/payment";

export interface PaymentListParams {
  page: number;
  size: number;
}

export const paymentApi = {
  listByCustomer: async (customerId: string, params: PaymentListParams): Promise<PageResponse<Payment>> => {
    const response = await axiosClient.get<PageResponse<Payment>>(`/payments/customer/${customerId}`, {
      params: { page: params.page, size: params.size },
    });
    return response.data;
  },

  getLedgerSummary: async (customerId: string): Promise<CustomerLedgerSummary> => {
    const response = await axiosClient.get<CustomerLedgerSummary>(`/payments/customer/${customerId}/summary`);
    return response.data;
  },

  create: async (payload: CreatePaymentRequest): Promise<Payment> => {
    const response = await axiosClient.post<Payment>("/payments", payload);
    return response.data;
  },
};
