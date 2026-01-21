import { useState } from "react";
import { StatsCard } from "@/components/StatsCard";
import { StockTable } from "@/components/StockTable";
import { SalesTable } from "@/components/SalesTable";
import { soldDevices, stockDevices } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Package,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Plus,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Layout } from "@/components/Layout";
import { useTabStore } from "@/stores/useTabStore";

const Index = () => {
  const { tab, setTab } = useTabStore();
  const navigate = useNavigate();

  // Calculate statistics
  const totalStock = stockDevices.length;
  const totalStockValue = stockDevices.reduce(
    (sum, device) => sum + device.valor_unitario,
    0
  );

  const completedSales = soldDevices.filter((d) => d.aparelho_recebido);
  const totalSales = completedSales.length;
  const totalRevenue = completedSales.reduce(
    (sum, device) => sum + device.valor_total_venda,
    0
  );
  const totalCost = completedSales.reduce(
    (sum, device) => sum + device.valor_compra,
    0
  );
  const totalProfit = totalRevenue - totalCost;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs
            value={tab}
            onValueChange={setTab}
            className="space-y-6"
          >
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                {/* <TabsTrigger value="overview">Visão Geral</TabsTrigger> */}
                <TabsTrigger value="overview">Estoque</TabsTrigger>
                <TabsTrigger value="sales">Vendas</TabsTrigger>
              </TabsList>
            </Tabs>


            <TabsContent value="overview" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => navigate("/stock/add")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar ao Estoque
                </Button>
              </div>
              <StockTable />
            </TabsContent>

            <TabsContent value="sales" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => navigate("/sale/add")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Venda
                </Button>
              </div>
              <SalesTable devices={soldDevices} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </Layout>
  );
};

export default Index;
