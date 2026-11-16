import axios from "axios";
import { COMMON_ERROR_MESSAGE } from "../constants/application-constant";

export interface ApiErrorInit {
  client: string;
  message: string;
  status?: number;
  code?: string;
  data?: unknown;
  isNetwork?: boolean;
  cause?: unknown;
}

/** What API clients throw. `message` is user-safe: the server's message or the common fallback. */
export class ApiError extends Error {
  readonly name = "ApiError";
  /** "track" or "demi". */
  readonly client: string;
  readonly status?: number;
  /** Error code from the body, e.g. "UnprocessableEventError". */
  readonly code?: string;
  readonly data?: unknown;
  /** No response arrived (offline, CORS, timeout). */
  readonly isNetwork: boolean;

  constructor(init: ApiErrorInit) {
    super(init.message, { cause: init.cause });
    this.client = init.client;
    this.status = init.status;
    this.code = init.code;
    this.data = init.data;
    this.isNetwork = init.isNetwork ?? false;
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError ||
  (typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "ApiError");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** Reads `{message}` or `{message: {message}}`. */
export const readErrorMessage = (data: unknown): string | undefined => {
  if (!isRecord(data)) return undefined;
  const { message } = data;
  if (isRecord(message) && typeof message.message === "string") {
    return message.message || undefined;
  }
  return typeof message === "string" && message ? message : undefined;
};

const readErrorCode = (data: unknown): string | undefined => {
  if (!isRecord(data)) return undefined;
  if (typeof data.code === "string") return data.code;
  const { message } = data;
  return isRecord(message) && typeof message.code === "string"
    ? message.code
    : undefined;
};

export const toApiError = (error: unknown, client: string): ApiError => {
  if (isApiError(error)) return error;
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    return new ApiError({
      client,
      message: readErrorMessage(data) ?? COMMON_ERROR_MESSAGE,
      status: error.response?.status,
      code: readErrorCode(data),
      data,
      isNetwork: !error.response,
      cause: error,
    });
  }
  return new ApiError({ client, message: COMMON_ERROR_MESSAGE, cause: error });
};
