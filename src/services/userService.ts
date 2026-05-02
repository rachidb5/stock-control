import api from "./api";
import { requestData } from "./serviceUtils";

export type UserAccessLevel = "vendedor" | "gestor" | "admin";

export interface ManagedUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: UserAccessLevel;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  phone: string;
  password: string;
  role?: UserAccessLevel;
}

export type UpdateUserPayload = Partial<CreateUserPayload> & {
  is_active?: boolean;
};

export const userService = {
  getUsers: async (): Promise<ManagedUser[]> => {
    return requestData(
      api.get<ManagedUser[]>("/users"),
      "Não foi possível carregar os usuários.",
    );
  },

  getUserById: async (id: string): Promise<ManagedUser> => {
    return requestData(
      api.get<ManagedUser>(`/users/${id}`),
      "Não foi possível carregar o usuário.",
    );
  },

  createUser: async (data: CreateUserPayload): Promise<ManagedUser> => {
    return requestData(
      api.post<ManagedUser>("/users", data),
      "Não foi possível criar o usuário.",
    );
  },

  updateUser: async (
    id: string,
    data: UpdateUserPayload,
  ): Promise<ManagedUser> => {
    return requestData(
      api.patch<ManagedUser>(`/users/${id}`, data),
      "Não foi possível atualizar o usuário.",
    );
  },

  deleteUser: async (id: string): Promise<void> => {
    await requestData(
      api.delete<void>(`/users/${id}`),
      "Não foi possível remover o usuário.",
    );
  },
};

export default userService;
