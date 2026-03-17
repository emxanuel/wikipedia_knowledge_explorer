const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiError {
  error?: string;
  message?: string;
  status_code?: number;
  details?: unknown;
}

export class ApiClientError extends Error {
  status: number;
  payload?: ApiError;

  constructor(message: string, status: number, payload?: ApiError) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<TResponse>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  } = {},
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const data = (await parseJsonSafely(response)) as ApiError | TResponse | null;

  if (!response.ok) {
    const payload = (data as ApiError) ?? {};
    const message =
      payload.message ||
      payload.error ||
      `Request failed with status ${response.status}`;
    throw new ApiClientError(message, response.status, payload);
  }

  return (data ?? ({} as TResponse)) as TResponse;
}

