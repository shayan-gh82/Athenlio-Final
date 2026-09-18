import axios, { type AxiosError } from "axios";

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number | null;
  readonly code: string;
  readonly fieldErrors: FieldErrors;

  constructor({
    message,
    status = null,
    code = "unknown_error",
    fieldErrors = {},
  }: {
    message: string;
    status?: number | null;
    code?: string;
    fieldErrors?: FieldErrors;
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return typeof value === "string" ? [value] : [];
}

function extractFieldErrors(data: unknown): FieldErrors {
  const errors: FieldErrors = {};
  function visit(value: unknown, path: string) {
    const messages = toStringArray(value);
    if (messages.length) errors[path || "detail"] = messages;
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        if (typeof child !== "string") visit(child, path ? `${path}.${key}` : key);
        else if (!Array.isArray(value)) errors[path ? `${path}.${key}` : key] = [child];
      }
    }
  }
  visit(data, "");
  return errors;
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (!axios.isAxiosError(error)) {
    return new ApiError({
      message: error instanceof Error ? error.message : "An unexpected error occurred.",
    });
  }

  const axiosError = error as AxiosError<unknown>;
  const data = axiosError.response?.data;
  const status = axiosError.response?.status ?? null;
  const fieldErrors = extractFieldErrors(data);
  const record = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : null;
  const detail = record && typeof record.detail === "string" ? record.detail : null;
  const message = detail ?? Object.values(fieldErrors).flat()[0] ?? axiosError.message;

  return new ApiError({
    message,
    status,
    code: axiosError.code ?? (status ? `http_${status}` : "network_error"),
    fieldErrors,
  });
}
