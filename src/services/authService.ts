import api from "./api";
import { requestData } from "./serviceUtils";

/* =======================
 * Interfaces
 * ======================= */

export interface LoginPayload {
  email?: string;
  password?: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  access_token?: string;
  accessToken?: string;
  user?: AuthUser;
}

/* =======================
 * Auth Service
 * ======================= */

export const authService = {
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    return requestData(
      api.post<AuthResponse>("/auth/login", data),
      "Não foi possível realizar o login.",
    );
  },

  register: async (data: RegisterPayload): Promise<AuthUser> => {
    return requestData(
      api.post<AuthUser>("/auth/register", data),
      "Não foi possível criar o usuário.",
    );
  },

  me: async (): Promise<AuthUser> => {
    return requestData(
      api.get<AuthUser>("/auth/me"),
      "Não foi possível buscar o usuário autenticado.",
    );
  },

  logout: async (): Promise<void> => {
    try {
      await requestData(
        api.post<void>("/auth/logout"),
        "Não foi possível encerrar a sessão.",
      );
    } finally {
      localStorage.removeItem("accessToken");
    }
  },
};

export default authService;
