import api from "./api";
import { requestData } from "./serviceUtils";

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
  getStock: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<StockResponse> => {
    return requestData(
      api.get<StockResponse>("/stock", { params }),
      "Não foi possível carregar o estoque.",
    );
  },

  getStockById: async (id: string): Promise<StockItem> => {
    return requestData(
      api.get<StockItem>(`/stock/${id}`),
      "Não foi possível carregar o item do estoque.",
    );
  },

  createStock: async (data: Omit<StockItem, "id">): Promise<StockItem> => {
    return requestData(
      api.post<StockItem>("/stock", data),
      "Não foi possível criar o item no estoque.",
    );
  },

  updateStock: async (
    id: string,
    data: Partial<StockItem>
  ): Promise<StockItem> => {
    const payload = { ...data };
    delete payload.imei;

    return requestData(
      api.put<StockItem>(`/stock/${id}`, payload),
      "Não foi possível atualizar o item do estoque.",
    );
  },

  deleteStock: async (id: string | number): Promise<void> => {
    await requestData(
      api.delete<void>(`/stock/${id}`),
      "Não foi possível remover o item do estoque.",
    );
  },
};

export default stockService;
