import { axiosClient } from "@/api/axiosClient";
import type { PageResponse } from "@/types/api";
import type { CustomerAsset, CustomerAssetRequest } from "@/types/asset";

export interface AssetListParams {
  page: number;
  size: number;
}

export const assetApi = {
  list: async (params: AssetListParams): Promise<PageResponse<CustomerAsset>> => {
    const response = await axiosClient.get<PageResponse<CustomerAsset>>("/assets", {
      params: { page: params.page, size: params.size },
    });
    return response.data;
  },

  listDue: async (params: AssetListParams): Promise<PageResponse<CustomerAsset>> => {
    const response = await axiosClient.get<PageResponse<CustomerAsset>>("/assets/due", {
      params: { page: params.page, size: params.size },
    });
    return response.data;
  },

  listByCustomer: async (customerId: string, params: AssetListParams): Promise<PageResponse<CustomerAsset>> => {
    const response = await axiosClient.get<PageResponse<CustomerAsset>>(`/assets/customer/${customerId}`, {
      params: { page: params.page, size: params.size },
    });
    return response.data;
  },

  getById: async (id: string): Promise<CustomerAsset> => {
    const response = await axiosClient.get<CustomerAsset>(`/assets/${id}`);
    return response.data;
  },

  create: async (payload: CustomerAssetRequest): Promise<CustomerAsset> => {
    const response = await axiosClient.post<CustomerAsset>("/assets", payload);
    return response.data;
  },

  update: async (id: string, payload: CustomerAssetRequest): Promise<CustomerAsset> => {
    const response = await axiosClient.put<CustomerAsset>(`/assets/${id}`, payload);
    return response.data;
  },

  deactivate: async (id: string): Promise<void> => {
    await axiosClient.patch(`/assets/${id}/deactivate`);
  },
};
