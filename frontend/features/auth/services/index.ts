import { AxiosError } from "axios";

import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  User,
} from "@/lib/auth";
import { httpClient } from "@/features/services/httpClient";

export async function authRegister(
  payload: RegisterPayload,
): Promise<User> {
  const response = await httpClient.post<User>("/auth/register", payload);
  return response.data;
}

export async function authLogin(
  payload: LoginPayload,
): Promise<LoginResponse> {
  const response = await httpClient.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

export async function authGetCurrentUser(): Promise<User | null> {
  try {
    const response = await httpClient.get<User>("/auth/me");
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function authLogout(): Promise<void> {
  await httpClient.post("/auth/logout");
}

