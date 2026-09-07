import { axiosClient } from "@/api/axiosClient";
import type { PageResponse } from "@/types/api";
import type { AmcContract, CreateAmcContractRequest } from "@/types/amc";

export interface AmcContractListParams {
  page: number;
  size: number;
}

export const amcApi = {
  listByAsset: async (
    customerAssetId: string,
    params: AmcContractListParams
  ): Promise<PageResponse<AmcContract>> => {
    const response = await axiosClient.get<PageResponse<AmcContract>>(`/amc-contracts/asset/${customerAssetId}`, {
      params: { page: params.page, size: params.size },
    });
    return response.data;
  },

  listByCustomer: async (
    customerId: string,
    params: AmcContractListParams
  ): Promise<PageResponse<AmcContract>> => {
    const response = await axiosClient.get<PageResponse<AmcContract>>(`/amc-contracts/customer/${customerId}`, {
      params: { page: params.page, size: params.size },
    });
    return response.data;
  },

  create: async (payload: CreateAmcContractRequest): Promise<AmcContract> => {
    const response = await axiosClient.post<AmcContract>("/amc-contracts", payload);
    return response.data;
  },

  cancel: async (id: string): Promise<AmcContract> => {
    const response = await axiosClient.patch<AmcContract>(`/amc-contracts/${id}/cancel`);
    return response.data;
  },
};
