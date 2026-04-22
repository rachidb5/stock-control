import api from "./api";

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
  }): Promise<SoldDeviceResponse> => {
    const response = await api.get<SoldDeviceResponse>("/sold-devices", { params });
    return response.data;
  },

  getSaleById: async (id: string | number): Promise<SoldDevice> => {
    const response = await api.get<SoldDevice>(`/sold-devices/${id}`);
    return response.data;
  },

  createSale: async (data: Omit<SoldDevice, "id">): Promise<SoldDevice> => {
    try {
      const response = await api.post<SoldDevice>("/sold-devices", data);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erro na API /sold-devices:", error);
      throw {
        message: error?.response?.data?.message || "Erro ao registrar venda",
        status: error?.response?.status,
      };
    }
  },

  updateSale: async (
    id: string | number,
    data: Partial<Omit<SoldDevice, "id">>
  ): Promise<SoldDevice> => {
    try {
      const response = await api.put<SoldDevice>(`/sold-devices/${id}`, data);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erro na API /sold-devices:", error);
      throw {
        message: error?.response?.data?.message || "Erro ao atualizar venda",
        status: error?.response?.status,
      };
    }
  },
};

export default sellService;
