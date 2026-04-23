import { StockTable } from "@/components/StockTable";
import { SalesTable } from "@/components/SalesTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useTabStore } from "@/stores/useTabStore";

const Index = () => {
  const { tab, setTab } = useTabStore();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <Tabs value={tab} onValueChange={setTab} className="space-y-6">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
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
              <SalesTable />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </Layout>
  );
};

export default Index;
