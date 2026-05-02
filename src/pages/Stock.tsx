// Stock.tsx
import { useState } from "react";
import { StockTable } from "@/components/StockTable";
import { Button } from "@/components/ui/button";
import { Package, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/StatsCard";
import { DollarSign, TrendingUp } from "lucide-react";

const Stock = () => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    totalStock: 0,
    totalValue: 0,
    totalProfit: 0,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleStatsUpdate = (data: { total: number; totalValue: number }) => {
    setStats({
      totalStock: data.total,
      totalValue: data.totalValue,
      totalProfit: 0, // Você pode calcular isso se tiver os dados de custo
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold sm:text-3xl">Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie todos os aparelhos em estoque
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleRefresh} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={() => navigate('/produto/add')} className="w-full sm:w-auto">
            <Package className="mr-2 h-4 w-4" />
            Adicionar Estoque
          </Button>
        </div>
      </div>

      {/* Estatísticas em tempo real */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Aparelhos em Estoque"
          value={stats.totalStock.toString()}
          description="Total de itens disponíveis"
          icon={Package}
          loading={false}
        />
        <StatsCard
          title="Valor do Estoque"
          value={formatCurrency(stats.totalValue)}
          description="Valor total investido"
          icon={DollarSign}
          loading={false}
        />
        <StatsCard
          title="Margem Estimada"
          value={stats.totalStock > 0 ? "30%" : "0%"}
          description="Baseado no valor de venda"
          icon={TrendingUp}
          loading={false}
          trend={{
            value: "+10%",
            positive: true,
          }}
        />
      </div>

      {/* Tabela de Estoque */}
      <StockTable 
        refreshTrigger={refreshKey}
        onStatsUpdate={handleStatsUpdate}
      />
    </div>
  );
};

export default Stock;
