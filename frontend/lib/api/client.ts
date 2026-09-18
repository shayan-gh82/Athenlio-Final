import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { authRetryExcludedEndpoints, endpoints } from "@/lib/api/endpoints";
import { normalizeApiError } from "@/lib/api/errors";
import { apiBaseUrl } from "@/lib/api/config";

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 20_000,
  headers: { Accept: "application/json" },
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 20_000,
  headers: { Accept: "application/json" },
});

let refreshRequest: Promise<void> | null = null;

function isRetryExcluded(url?: string): boolean {
  if (!url) return false;
  return [...authRetryExcludedEndpoints].some((endpoint) => url.endsWith(endpoint));
}

function notifyAuthExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("athenlio:auth-expired"));
  }
}

apiClient.interceptors.response.use(
  (response) => {
    // Dashboard serializers may return relative media URLs without request context.
    const resolveMedia = (value: unknown): unknown => {
      if (typeof value === "string" && value.startsWith("/media/") && apiBaseUrl) return new URL(value, apiBaseUrl).href;
      if (Array.isArray(value)) return value.map(resolveMedia);
      if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, resolveMedia(child)]));
      return value;
    };
    response.data = resolveMedia(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined;
    const shouldRefresh =
      error.response?.status === 401 &&
      request &&
      !request._retry &&
      !isRetryExcluded(request.url);

    if (!shouldRefresh) {
      return Promise.reject(normalizeApiError(error));
    }

    request._retry = true;

    refreshRequest ??= refreshClient
      .post(endpoints.auth.refresh)
      .then(() => undefined)
      .finally(() => {
        refreshRequest = null;
      });

    try {
      await refreshRequest;
      return apiClient(request);
    } catch (refreshError) {
      notifyAuthExpired();
      return Promise.reject(normalizeApiError(refreshError));
    }
  },
);
