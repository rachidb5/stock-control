import api, { clearAuthTokens, setAccessToken } from "./api";
import { requestData } from "./serviceUtils";
import type { UserAccessLevel } from "./userService";

export interface LoginPayload {
  email?: string;
  password?: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: UserAccessLevel;
}

export interface AuthResponse {
  access_token?: string;
  accessToken?: string;
  expires_in?: string;
  user?: AuthUser;
}

export const authService = {
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await requestData(
      api.post<AuthResponse>("/auth/login", data),
      "Nao foi possivel realizar o login.",
    );
    setAccessToken(response.access_token ?? response.accessToken);
    return response;
  },

  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await requestData(
      api.post<AuthResponse>("/auth/register", data),
      "Nao foi possivel criar o usuario.",
    );
    setAccessToken(response.access_token ?? response.accessToken);
    return response;
  },

  me: async (): Promise<AuthUser> => {
    return requestData(
      api.get<AuthUser>("/auth/me"),
      "Nao foi possivel buscar o usuario autenticado.",
    );
  },

  logout: async (): Promise<void> => {
    try {
      await requestData(
        api.post<void>("/auth/logout"),
        "Nao foi possivel encerrar a sessao.",
      );
    } catch {
      // Mesmo se o access token expirou, limpamos a sessao local e o cookie.
    } finally {
      clearAuthTokens();
    }
  },
};

export default authService;
