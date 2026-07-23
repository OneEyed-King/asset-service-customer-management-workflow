import axios, { type AxiosError } from "axios";
import { tokenStorage } from "@/utils/tokenStorage";
import type { ApiErrorResponse } from "@/types/api";

/**
 * REACT/AXIOS CONCEPT: a single shared Axios instance ("client").
 * Every API call in the app goes through this instance instead of calling
 * `axios.get(...)` directly. That lets us configure the base URL and attach
 * request/response "interceptors" (functions that run before every request
 * or after every response) in exactly one place.
 */
export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach the JWT (if we have one) to every outgoing request.
axiosClient.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: on a 401 (token missing/expired/invalid), clear the
// stored token and force the user back to the login page.
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      tokenStorage.clearToken();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Pulls a human-readable message out of an Axios error, falling back to a
 * generic message if the backend didn't send one. Use this in catch blocks
 * across the app so error toasts stay consistent.
 */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message) return data.message;
    if (typeof error.response?.data === "string" && error.response.data.length > 0) {
      return error.response.data;
    }
    if (error.message) return error.message;
  }
  return fallback;
}
