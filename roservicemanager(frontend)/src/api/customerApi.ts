import { axiosClient } from "@/api/axiosClient";
import type { PageResponse } from "@/types/api";
import type { Customer, CustomerAutocompleteResult, CustomerRequest } from "@/types/customer";

export interface CustomerListParams {
  page: number;
  size: number;
  search?: string;
}

export const customerApi = {
  list: async (params: CustomerListParams): Promise<PageResponse<Customer>> => {
    const response = await axiosClient.get<PageResponse<Customer>>("/customers", {
      params: {
        page: params.page,
        size: params.size,
        ...(params.search ? { search: params.search } : {}),
      },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await axiosClient.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  create: async (payload: CustomerRequest): Promise<Customer> => {
    const response = await axiosClient.post<Customer>("/customers", payload);
    return response.data;
  },

  update: async (id: string, payload: CustomerRequest): Promise<Customer> => {
    const response = await axiosClient.put<Customer>(`/customers/${id}`, payload);
    return response.data;
  },

  deactivate: async (id: string): Promise<void> => {
    await axiosClient.patch(`/customers/${id}/deactivate`);
  },

  autocomplete: async (query: string): Promise<CustomerAutocompleteResult[]> => {
    const response = await axiosClient.get<CustomerAutocompleteResult[]>("/customers/search", {
      params: { q: query },
    });
    return response.data;
  },
};
