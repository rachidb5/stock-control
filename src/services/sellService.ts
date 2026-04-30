import api from "./api";
import { requestData } from "./serviceUtils";

export interface SoldDevice {
  id: string | number;
  data: string;
  aparelho: string;
  cor: string;
  condicao: string;
  imei: string;
  fornecedor: string;
  valor_compra: number;
  comprador: string;
  numero_telefone: string;
  aparelho_recebido: boolean;
  observacao?: string;
  valor_recebido: number;
  preco_vista: number;
  preco_cartao: number;
  valor_entrega: number;
  valor_capa_pelicula: number;
  valor_total_venda: number;
  vendedor_id?: string;
  vendedor_nome?: string;
  canal_venda?: string;
}

export interface SoldDeviceResponse {
  data: SoldDevice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const sellService = {
  getSales: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "completed" | "pending";
    condition?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SoldDeviceResponse> => {
    return requestData(
      api.get<SoldDeviceResponse>("/sold-devices", { params }),
      "Não foi possível carregar as vendas.",
    );
  },

  getSaleById: async (id: string | number): Promise<SoldDevice> => {
    return requestData(
      api.get<SoldDevice>(`/sold-devices/${id}`),
      "Não foi possível carregar a venda.",
    );
  },

  createSale: async (data: Omit<SoldDevice, "id">): Promise<SoldDevice> => {
    return requestData(
      api.post<SoldDevice>("/sold-devices", data),
      "Não foi possível registrar a venda.",
    );
  },

  updateSale: async (
    id: string | number,
    data: Partial<Omit<SoldDevice, "id">>
  ): Promise<SoldDevice> => {
    return requestData(
      api.put<SoldDevice>(`/sold-devices/${id}`, data),
      "Não foi possível atualizar a venda.",
    );
  },

  deleteSale: async (id: string | number): Promise<void> => {
    await requestData(
      api.delete<void>(`/sold-devices/${id}`),
      "Não foi possível remover a venda.",
    );
  },
};

export default sellService;
