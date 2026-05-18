import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

const baseURL = import.meta.env.VITE_API_URL || "https://estoque-api.fly.dev";
const ACCESS_TOKEN_STORAGE_KEY = "accessToken";

const getStoredAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

let accessToken: string | null = getStoredAccessToken();
let refreshRequest: Promise<string | null> | null = null;

interface RetriableAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  access_token?: string;
  accessToken?: string;
}

const api = axios.create({
  baseURL,
  //  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAccessToken = (token?: string | null) => {
  accessToken = token ?? null;

  if (!accessToken) {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
};

export const clearAuthTokens = () => {
  accessToken = null;
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
};

const isAuthRoute = (url?: string) =>
  Boolean(
    url?.includes("/auth/login") ||
      url?.includes("/auth/register") ||
      url?.includes("/auth/refresh"),
  );

const refreshAccessToken = async () => {
  if (!refreshRequest) {
    refreshRequest = axios
      .post<RefreshResponse>(
        `${baseURL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      )
      .then((response) => {
        const token = response.data.access_token ?? response.data.accessToken;
        setAccessToken(token);
        return token ?? null;
      })
      .catch(() => {
        clearAuthTokens();
        return null;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
};

const redirectToAuth = () => {
  if (window.location.pathname !== "/auth") {
    window.location.href = "/auth";
  }
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetriableAxiosRequestConfig;
    const url = originalRequest?.url;

    if (status === 401 && !isAuthRoute(url) && !originalRequest?._retry) {
      originalRequest._retry = true;
      const token = await refreshAccessToken();

      if (token) {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${token}`,
        };
        return api(originalRequest);
      }

      redirectToAuth();
    }

    return Promise.reject(error);
  },
);

export default api;
