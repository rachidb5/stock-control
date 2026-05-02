import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { SalesTable } from "@/components/SalesTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getVisibleSales } from "@/lib/salesInsights";
import commercialDashboardService from "@/services/commercialDashboardService";
import { selectCurrentUser, useSessionStore } from "@/stores/useSessionStore";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CommercialDashboard() {
  const navigate = useNavigate();
  const currentUser = useSessionStore(selectCurrentUser);
  const users = useSessionStore((state) => state.users);
  const dashboardQuery = useQuery({
    queryKey: ["commercial-dashboard"],
    queryFn: commercialDashboardService.getDashboard,
    staleTime: 2 * 60 * 1000,
  });
  const dashboard = dashboardQuery.data;
  const allSales = dashboard?.sales ?? [];
  const visibleSales = useMemo(
    () => getVisibleSales(allSales, currentUser),
    [allSales, currentUser],
  );
  const stockSummary = dashboard?.stockSummary ?? { total: 0, totalValue: 0 };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Painel Comercial</h2>
            <p className="text-muted-foreground">
              Indicadores, gráficos, metas e histórico para acompanhar a performance de vendas.
            </p>
          </div>
          <Button onClick={() => navigate("/sale/add")} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nova venda
          </Button>
        </div>

        {dashboardQuery.isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              Carregando dados comerciais...
            </CardContent>
          </Card>
        ) : dashboardQuery.isError ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Nao foi possivel carregar o painel comercial agora.
              </p>
              <Button
                variant="outline"
                onClick={() => dashboardQuery.refetch()}
                disabled={dashboardQuery.isFetching}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    dashboardQuery.isFetching ? "animate-spin" : ""
                  }`}
                />
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <SalesOverview
              currentUser={currentUser}
              users={users}
              visibleSales={visibleSales}
              allSales={allSales}
              stockSummary={stockSummary}
            />

            <SalesTable
              devices={visibleSales}
              showSeller={currentUser.role === "gestor"}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
