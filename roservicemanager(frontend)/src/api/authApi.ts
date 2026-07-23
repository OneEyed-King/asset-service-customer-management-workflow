import { axiosClient } from "@/api/axiosClient";
import type { CurrentUser, LoginRequest, LoginResponse } from "@/types/auth";

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>("/auth/login", payload);
    return response.data;
  },
  me: async (): Promise<CurrentUser> => {
    const response = await axiosClient.get<CurrentUser>("/auth/me");
    return response.data;
  },
};
