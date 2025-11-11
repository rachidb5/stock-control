import { useState } from "react";
import { StatsCard } from "@/components/StatsCard";
import { StockTable } from "@/components/StockTable";
import { SalesTable } from "@/components/SalesTable";
import { soldDevices, stockDevices } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, ShoppingCart, DollarSign, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  // Calculate statistics
  const totalStock = stockDevices.length;
  const totalStockValue = stockDevices.reduce((sum, device) => sum + device.valor_unitario, 0);
  
  const completedSales = soldDevices.filter(d => d.aparelho_recebido);
  const totalSales = completedSales.length;
  const totalRevenue = completedSales.reduce((sum, device) => sum + device.valor_total_venda, 0);
  const totalCost = completedSales.reduce((sum, device) => sum + device.valor_compra, 0);
  const totalProfit = totalRevenue - totalCost;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de Estoque</h1>
            <p className="text-muted-foreground mt-1">Sistema de gerenciamento de aparelhos</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="stock">Estoque</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Aparelhos em Estoque"
                value={totalStock.toString()}
                description="Total de itens disponíveis"
                icon={Package}
              />
              <StatsCard
                title="Valor do Estoque"
                value={formatCurrency(totalStockValue)}
                description="Valor total investido"
                icon={DollarSign}
              />
              <StatsCard
                title="Vendas Concluídas"
                value={totalSales.toString()}
                description={`${soldDevices.length - totalSales} pendentes`}
                icon={ShoppingCart}
              />
              <StatsCard
                title="Lucro Total"
                value={formatCurrency(totalProfit)}
                description={`Receita: ${formatCurrency(totalRevenue)}`}
                icon={TrendingUp}
                trend={{
                  value: `${((totalProfit / totalCost) * 100).toFixed(1)}%`,
                  positive: totalProfit > 0,
                }}
              />
            </div>

            {/* Recent Sales Preview */}
            <SalesTable devices={soldDevices.slice(0, 5)} />
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => navigate("/stock/add")}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar ao Estoque
              </Button>
            </div>
            <StockTable devices={stockDevices} />
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
  );
};

export default Index;
