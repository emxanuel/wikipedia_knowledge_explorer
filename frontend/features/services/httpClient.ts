import axios, { AxiosError } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type AuthErrorHandler = () => void;

let authErrorHandler: AuthErrorHandler | null = null;

export function setAuthErrorHandler(handler: AuthErrorHandler) {
  authErrorHandler = handler;
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const status = error.response?.status;

    // Normalize message from backend detail when present.
    const backendDetail = error.response?.data?.detail;
    if (typeof backendDetail === "string" && backendDetail.trim().length > 0) {
      error.message = backendDetail;
    } else if (!error.message || error.message.trim().length === 0) {
      error.message = "Something went wrong. Please try again.";
    }

    // Handle unauthorized / forbidden: trigger logout flow.
    if (status === 401 || status === 403) {
      if (authErrorHandler) {
        authErrorHandler();
      }
    }

    return Promise.reject(error);
  },
);

