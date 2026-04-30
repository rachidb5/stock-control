import api from "./api";
import { requestData } from "./serviceUtils";

export interface Client {
  id: string | number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco?: string;
  cidade: string;
  estado: string;
  cep: string;
  data_cadastro: string;
  total_compras: number;
}

export type ClientInput = Omit<Client, "id">;

export interface ClientResponse {
  data: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const clientService = {
  getClients: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ClientResponse> => {
    return requestData(
      api.get<ClientResponse>("/clients", { params }),
      "Não foi possível carregar os clientes.",
    );
  },

  getClientById: async (id: string | number): Promise<Client> => {
    return requestData(
      api.get<Client>(`/clients/${id}`),
      "Não foi possível carregar o cliente.",
    );
  },

  createClient: async (data: ClientInput): Promise<Client> => {
    return requestData(
      api.post<Client>("/clients", data),
      "Não foi possível criar o cliente.",
    );
  },

  updateClient: async (
    id: string | number,
    data: Partial<ClientInput>,
  ): Promise<Client> => {
    return requestData(
      api.put<Client>(`/clients/${id}`, data),
      "Não foi possível atualizar o cliente.",
    );
  },

  deleteClient: async (id: string | number): Promise<void> => {
    await requestData(
      api.delete<void>(`/clients/${id}`),
      "Não foi possível remover o cliente.",
    );
  },
};

export default clientService;
