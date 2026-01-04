import api from "./api";

export interface StockItem {
  valor_unitario: number;
  id: string;
  imei: string;
  modelo: string;
  marca: string;
  cor: string;
  capacidade: string;
  preco: number;
  condicao: string;
  dataEntrada: string;
  fornecedor: string;
  observacao?: string;
}

export interface StockResponse {
  data: StockItem[];
  total: number;
  page: number;
  limit: number;
}

export const stockService = {
  // Listar todo o estoque
  getStock: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<StockResponse> => {
    const response = await api.get<StockResponse>("/stock", { params });
    return response.data;
  },

  // Buscar item por Id
  getStockById: async (id: string): Promise<StockItem> => {
    const response = await api.get<StockItem>(`/stock/${id}`);
    return response.data;
  },

  // Criar novo item no estoque
  createStock: async (data: Omit<StockItem, "id">): Promise<StockItem> => {
    try {
      const response = await api.post<StockItem>("/stock", data);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erro na API /estoque:", error);

      throw {
        message:
          error?.response?.data?.message || "Erro ao criar item no estoque",
        status: error?.response?.status,
      };
    }
  },

  // Atualizar item do estoque
  updateStock: async (
    id: string,
    data: Partial<StockItem>
  ): Promise<StockItem> => {
    try {
      delete data.imei;
      const response = await api.put<StockItem>(`/stock/${id}`, data);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erro na API /estoque:", error);

      throw {
        message:
          error?.response?.data?.message || "Erro ao atualizar item no estoque",
        status: error?.response?.status,
      };
    }
  },

  // Remover item do estoque
  deleteStock: async (imei: string): Promise<void> => {
    await api.delete(`/stock/${imei}`);
  },
};

export default stockService;
