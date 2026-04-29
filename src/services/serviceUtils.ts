import { AxiosError, AxiosResponse, isAxiosError } from "axios";

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  code?: string;
  details?: unknown;
};

export type ServiceErrorOptions = {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
  isNetworkError?: boolean;
};

export class ServiceError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
  isNetworkError: boolean;

  constructor(options: ServiceErrorOptions) {
    super(options.message);
    this.name = "ServiceError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.isNetworkError = options.isNetworkError ?? false;
  }
}

const resolveMessage = (
  message: ApiErrorBody["message"],
): string | undefined => {
  if (Array.isArray(message)) {
    return message.filter(Boolean).join(", ");
  }

  return message;
};

export const normalizeServiceError = (
  error: unknown,
  fallbackMessage: string,
): ServiceError => {
  if (error instanceof ServiceError) {
    return error;
  }

  if (isAxiosError<ApiErrorBody>(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const data = axiosError.response?.data;
    const message =
      resolveMessage(data?.message) ||
      data?.error ||
      (axiosError.response
        ? fallbackMessage
        : "Não foi possível conectar ao servidor.");

    return new ServiceError({
      message,
      status: axiosError.response?.status,
      code: data?.code || axiosError.code,
      details: data?.details ?? data,
      isNetworkError: !axiosError.response,
    });
  }

  if (error instanceof Error) {
    return new ServiceError({
      message: error.message || fallbackMessage,
    });
  }

  return new ServiceError({ message: fallbackMessage });
};

export const requestData = async <T>(
  request: Promise<AxiosResponse<T>>,
  fallbackMessage: string,
): Promise<T> => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    throw normalizeServiceError(error, fallbackMessage);
  }
};
