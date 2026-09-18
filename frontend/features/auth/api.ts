import type { LoginPayload, MeResponse, RegisterPayload } from "@/features/auth/types";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export async function getMe() {
  const response = await apiClient.get<MeResponse>(endpoints.auth.me);
  return response.data;
}

export async function login(payload: LoginPayload) {
  await apiClient.post(endpoints.auth.login, payload);
  return getMe();
}

export async function register(payload: RegisterPayload) {
  const response = await apiClient.post<MeResponse>(endpoints.auth.register, payload);
  return response.data;
}

export async function logout() {
  await apiClient.post(endpoints.auth.logout);
}
