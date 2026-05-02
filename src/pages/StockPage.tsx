import { Layout } from "@/components/Layout";
import { StockTable } from "@/components/StockTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StockPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Estoque</h2>
            <p className="text-muted-foreground">
              Consulte disponibilidade, exporte relatórios e cadastre novos aparelhos.
            </p>
          </div>
          <Button onClick={() => navigate("/produto/add")} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar ao estoque
          </Button>
        </div>

        <StockTable />
      </div>
    </Layout>
  );
}
