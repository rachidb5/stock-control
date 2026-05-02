import api from "./api";
import { requestData } from "./serviceUtils";

export interface Supplier {
  id: string | number;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco?: string;
  cidade: string;
  estado: string;
  cep: string;
  data_cadastro: string;
}

export type SupplierInput = Omit<Supplier, "id">;

export interface SupplierResponse {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const supplierService = {
  getSuppliers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<SupplierResponse> => {
    return requestData(
      api.get<SupplierResponse>("/suppliers", { params }),
      "Nao foi possivel carregar os fornecedores.",
    );
  },

  getSupplierById: async (id: string | number): Promise<Supplier> => {
    return requestData(
      api.get<Supplier>(`/suppliers/${id}`),
      "Nao foi possivel carregar o fornecedor.",
    );
  },

  createSupplier: async (data: SupplierInput): Promise<Supplier> => {
    return requestData(
      api.post<Supplier>("/suppliers", data),
      "Nao foi possivel criar o fornecedor.",
    );
  },

  updateSupplier: async (
    id: string | number,
    data: Partial<SupplierInput>,
  ): Promise<Supplier> => {
    return requestData(
      api.put<Supplier>(`/suppliers/${id}`, data),
      "Nao foi possivel atualizar o fornecedor.",
    );
  },

  deleteSupplier: async (id: string | number): Promise<void> => {
    await requestData(
      api.delete<void>(`/suppliers/${id}`),
      "Nao foi possivel remover o fornecedor.",
    );
  },
};

export default supplierService;
