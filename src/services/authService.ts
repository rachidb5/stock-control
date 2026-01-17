import api from "./api";

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
  accessToken: string;
  user: AuthUser;
}

/* =======================
 * Auth Service
 * ======================= */

export const authService = {
  // Login
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", data);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erro na API /auth/login:", error);

      throw {
        message:
          error?.response?.data?.message || "Erro ao realizar login",
        status: error?.response?.status,
      };
    }
  },

  // Registro
  register: async (data: RegisterPayload): Promise<AuthUser> => {
    try {
      const response = await api.post<AuthUser>("/auth/register", data);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erro na API /auth/register:", error);

      throw {
        message:
          error?.response?.data?.message || "Erro ao criar usuário",
        status: error?.response?.status,
      };
    }
  },

  // Buscar usuário autenticado
  me: async (): Promise<AuthUser> => {
    try {
      const response = await api.get<AuthUser>("/auth/me");
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erro na API /auth/me:", error);

      throw {
        message:
          error?.response?.data?.message || "Erro ao buscar usuário",
        status: error?.response?.status,
      };
    }
  },

  // Logout (opcional — depende do backend)
  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erro na API /auth/logout:", error);
    }
  },
};

export default authService;
