import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SalesTable } from "@/components/SalesTable";
import { StockTable } from "@/components/StockTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, ShoppingCart } from "lucide-react";

const validTabs = new Set(["estoque", "vendas"]);

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab") ?? "estoque";
    return validTabs.has(tab) ? tab : "estoque";
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handlePrimaryAction = () => {
    navigate(activeTab === "vendas" ? "/sale/add" : "/stock/add");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
            <p className="text-muted-foreground">
              Gerencie o estoque disponível e o histórico de vendas em um só
              lugar.
            </p>
          </div>
          <Button onClick={handlePrimaryAction}>
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === "vendas" ? "Registrar venda" : "Adicionar ao estoque"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="estoque" className="gap-2">
              <Package className="h-4 w-4" />
              Estoque
            </TabsTrigger>
            <TabsTrigger value="vendas" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Vendas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="estoque" className="mt-6">
            <StockTable />
          </TabsContent>
          <TabsContent value="vendas" className="mt-6">
            <SalesTable showSeller useApi />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
