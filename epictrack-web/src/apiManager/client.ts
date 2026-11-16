import axios, { AxiosInstance, AxiosRequestConfig, ResponseType } from "axios";
import { toApiError } from "./apiError";

export interface ApiClientOptions {
  /** Used in errors, e.g. "track" or "demi". */
  name: string;
  baseURL: string;
  getToken: () => string | undefined;
  headers?: Record<string, string>;
}

export interface RequestOptions {
  params?: Record<string, unknown> | URLSearchParams;
  headers?: Record<string, string>;
  responseType?: ResponseType;
  signal?: AbortSignal;
}

/** Methods resolve to the response body and reject with an ApiError. */
export interface ApiClient {
  readonly name: string;
  /** For interceptors and the legacy helpers only. */
  readonly raw: AxiosInstance;
  get<T>(url: string, options?: RequestOptions): Promise<T>;
  post<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T>;
  put<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T>;
  patch<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T>;
  delete<T>(url: string, options?: RequestOptions): Promise<T>;
  /** axios converts a plain object body to FormData. */
  postMultipart<T>(
    url: string,
    body: FormData | object,
    options?: RequestOptions,
  ): Promise<T>;
}

const toConfig = (options?: RequestOptions): AxiosRequestConfig => ({
  params: options?.params,
  headers: options?.headers,
  responseType: options?.responseType,
  signal: options?.signal,
});

export const createApiClient = ({
  name,
  baseURL,
  getToken,
  headers,
}: ApiClientOptions): ApiClient => {
  const raw = axios.create({ baseURL, headers });

  raw.interceptors.request.use((config) => {
    const token = getToken();
    if (token && !config.headers.has("Authorization")) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });

  const send = async <T>(config: AxiosRequestConfig): Promise<T> => {
    let response;
    try {
      response = await raw.request<T>(config);
    } catch (error) {
      throw toApiError(error, name);
    }
    // AxiosErrorHandler resolves errors that have no response.
    if (axios.isAxiosError(response)) throw toApiError(response, name);
    return response.data;
  };

  return {
    name,
    raw,
    get: <T>(url: string, options?: RequestOptions) =>
      send<T>({ ...toConfig(options), method: "get", url }),
    post: <T>(url: string, body?: unknown, options?: RequestOptions) =>
      send<T>({ ...toConfig(options), method: "post", url, data: body }),
    put: <T>(url: string, body?: unknown, options?: RequestOptions) =>
      send<T>({ ...toConfig(options), method: "put", url, data: body }),
    patch: <T>(url: string, body?: unknown, options?: RequestOptions) =>
      send<T>({ ...toConfig(options), method: "patch", url, data: body }),
    delete: <T>(url: string, options?: RequestOptions) =>
      send<T>({ ...toConfig(options), method: "delete", url }),
    postMultipart: <T>(
      url: string,
      body: FormData | object,
      options?: RequestOptions,
    ) =>
      send<T>({
        ...toConfig(options),
        method: "post",
        url,
        data: body,
        headers: { ...options?.headers, "Content-Type": "multipart/form-data" },
      }),
  };
};
