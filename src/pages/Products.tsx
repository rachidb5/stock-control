import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SalesTable } from "@/components/SalesTable";
import { StockTable } from "@/components/StockTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Search, ShoppingCart, X } from "lucide-react";

const validTabs = new Set(["estoque", "vendas"]);

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab") ?? "estoque";
    return validTabs.has(tab) ? tab : "estoque";
  }, [searchParams]);
  const search = searchParams.get("busca") ?? "";
  const observation = searchParams.get("observacao") ?? "all";
  const status = searchParams.get("status") ?? "all";
  const condition = searchParams.get("condicao") ?? "all";
  const startDate = searchParams.get("inicio") ?? "";
  const endDate = searchParams.get("fim") ?? "";
  const page = Math.max(Number(searchParams.get("pagina") ?? 1) || 1, 1);
  const [draftFilters, setDraftFilters] = useState({
    search,
    observation,
    status,
    condition,
    startDate,
    endDate,
  });

  useEffect(() => {
    setDraftFilters({
      search,
      observation,
      status,
      condition,
      startDate,
      endDate,
    });
  }, [search, observation, status, condition, startDate, endDate]);

  const handleTabChange = (tab: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    next.delete("pagina");
    setSearchParams(next);
  };

  const updateDraftFilter = (key: keyof typeof draftFilters, value: string) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", activeTab);
    next.delete("pagina");

    const filters =
      activeTab === "estoque"
        ? {
            busca: draftFilters.search,
            observacao: draftFilters.observation,
          }
        : {
            busca: draftFilters.search,
            inicio: draftFilters.startDate,
            fim: draftFilters.endDate,
            status: draftFilters.status,
            condicao: draftFilters.condition,
          };

    Object.entries(filters).forEach(([key, value]) => {
      if (!value || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams({ tab: activeTab });
  };

  const handlePageChange = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", activeTab);
    next.set("pagina", String(nextPage));
    setSearchParams(next);
  };

  const handlePrimaryAction = () => {
    navigate(activeTab === "vendas" ? "/sale/add" : "/produto/add");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Produtos</h2>
            <p className="text-muted-foreground">
              Gerencie o estoque disponível e o histórico de vendas em um só
              lugar.
            </p>
          </div>
          <Button onClick={handlePrimaryAction} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === "vendas" ? "Registrar venda" : "Adicionar ao estoque"}
          </Button>
        </div>

        <div className="page-surface grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={draftFilters.search}
              onChange={(event) => updateDraftFilter("search", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyFilters();
                }
              }}
              placeholder={
                activeTab === "vendas"
                  ? "Buscar por aparelho, comprador ou IMEI..."
                  : "Buscar por modelo, cor ou IMEI..."
              }
              className="pl-8"
            />
          </div>

          {activeTab === "estoque" ? (
            <Select
              value={draftFilters.observation}
              onValueChange={(value) => updateDraftFilter("observation", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Observação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as observações</SelectItem>
                <SelectItem value="with">Com observação</SelectItem>
                <SelectItem value="without">Sem observação</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <>
              <Input
                type="date"
                value={draftFilters.startDate}
                onChange={(event) => updateDraftFilter("startDate", event.target.value)}
              />
              <Input
                type="date"
                value={draftFilters.endDate}
                onChange={(event) => updateDraftFilter("endDate", event.target.value)}
              />
              <Select
                value={draftFilters.status}
                onValueChange={(value) => updateDraftFilter("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={draftFilters.condition}
                onValueChange={(value) => updateDraftFilter("condition", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Condição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as condições</SelectItem>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Seminovo">Seminovo</SelectItem>
                  <SelectItem value="Usado">Usado</SelectItem>
                  <SelectItem value="Recondicionado">Recondicionado</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}

          <Button type="button" onClick={applyFilters} className="w-full">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
          >
            <X className="mr-2 h-4 w-4" />
            Limpar filtros
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 sm:max-w-md">
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
            <StockTable
              search={search}
              observation={observation}
              hideFilters
              page={page}
              onPageChange={handlePageChange}
            />
          </TabsContent>
          <TabsContent value="vendas" className="mt-6">
            <SalesTable
              showSeller
              useApi
              hideFilters
              search={search}
              status={status}
              condition={condition}
              startDate={startDate}
              endDate={endDate}
              page={page}
              onPageChange={handlePageChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
