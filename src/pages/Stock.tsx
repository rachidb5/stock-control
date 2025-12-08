import { StockTable } from "@/components/StockTable";
import { stockDevices } from "@/data/mockData";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Stock = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie todos os aparelhos em estoque
          </p>
        </div>
        <Button onClick={() => navigate('/stock/new')}>
          <Package className="mr-2 h-4 w-4" />
          Adicionar Estoque
        </Button>
      </div>

      <StockTable devices={stockDevices} />
    </div>
  );
};

export default Stock;
