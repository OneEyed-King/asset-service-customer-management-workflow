import { axiosClient } from "@/api/axiosClient";
import type { PageResponse } from "@/types/api";
import type { ServiceHistoryEntry, ServiceHistoryRequest } from "@/types/serviceHistory";

export interface ServiceHistoryListParams {
  page: number;
  size: number;
}

export const serviceHistoryApi = {
  listAll: async (params: ServiceHistoryListParams): Promise<PageResponse<ServiceHistoryEntry>> => {
    const response = await axiosClient.get<PageResponse<ServiceHistoryEntry>>("/service-history", {
      params: { page: params.page, size: params.size },
    });
    return response.data;
  },

  listByAsset: async (
    customerAssetId: string,
    params: ServiceHistoryListParams
  ): Promise<PageResponse<ServiceHistoryEntry>> => {
    const response = await axiosClient.get<PageResponse<ServiceHistoryEntry>>(
      `/service-history/asset/${customerAssetId}`,
      { params: { page: params.page, size: params.size } }
    );
    return response.data;
  },

  listByCustomer: async (
    customerId: string,
    params: ServiceHistoryListParams
  ): Promise<PageResponse<ServiceHistoryEntry>> => {
    const response = await axiosClient.get<PageResponse<ServiceHistoryEntry>>(
      `/service-history/customer/${customerId}`,
      { params: { page: params.page, size: params.size } }
    );
    return response.data;
  },

  create: async (payload: ServiceHistoryRequest): Promise<ServiceHistoryEntry> => {
    const response = await axiosClient.post<ServiceHistoryEntry>("/service-history", payload);
    return response.data;
  },
};
