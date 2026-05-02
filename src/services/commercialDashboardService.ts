import api from "./api";
import { requestData } from "./serviceUtils";
import type { SoldDevice } from "./sellService";

export interface CommercialDashboardResponse {
  sales: SoldDevice[];
  stockSummary: {
    total: number;
    totalValue: number;
  };
}

export const commercialDashboardService = {
  getDashboard: async (): Promise<CommercialDashboardResponse> => {
    return requestData(
      api.get<CommercialDashboardResponse>("/dashboard/commercial"),
      "Nao foi possivel carregar o painel comercial.",
    );
  },
};

export default commercialDashboardService;
