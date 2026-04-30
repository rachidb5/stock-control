import { useMemo } from "react";
import { Layout } from "@/components/Layout";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { SalesTable } from "@/components/SalesTable";
import { Button } from "@/components/ui/button";
import { soldDevices, stockDevices } from "@/data/mockData";
import { getVisibleSales } from "@/lib/salesInsights";
import { selectCurrentUser, useSessionStore } from "@/stores/useSessionStore";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CommercialDashboard() {
  const navigate = useNavigate();
  const currentUser = useSessionStore(selectCurrentUser);
  const users = useSessionStore((state) => state.users);
  const visibleSales = useMemo(
    () => getVisibleSales(soldDevices, currentUser),
    [currentUser],
  );
  const stockSummary = useMemo(
    () => ({
      total: stockDevices.length,
      totalValue: stockDevices.reduce(
        (sum, device) => sum + (device.valor_unitario ?? 0),
        0,
      ),
    }),
    [],
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Painel Comercial</h2>
            <p className="text-muted-foreground">
              Indicadores, gráficos, metas e histórico para acompanhar a performance de vendas.
            </p>
          </div>
          <Button onClick={() => navigate("/sale/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Nova venda
          </Button>
        </div>

        <SalesOverview
          currentUser={currentUser}
          users={users}
          visibleSales={visibleSales}
          allSales={soldDevices}
          stockSummary={stockSummary}
        />

        <SalesTable devices={visibleSales} showSeller={currentUser.role === "gestor"} />
      </div>
    </Layout>
  );
}
