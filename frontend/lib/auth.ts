import { apiFetch } from "./api";

export interface User {
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const user = await apiFetch<User>("/auth/register", {
    method: "POST",
    body: payload,
  });
  return user;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
  return response;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await apiFetch<User>("/auth/me", {
      method: "GET",
    });
    return user;
  } catch (error) {
    return null;
  }
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/auth/logout", {
    method: "POST",
  });
}


