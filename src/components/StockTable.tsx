import { useState, useEffect, useCallback } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Edit, FileDown, Upload, FileSpreadsheet, ShoppingCart, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { exportRowsToWorkbook, importRowsFromWorkbook, type ExcelRow } from "@/lib/excel";
import { stockService, StockItem, StockResponse } from "@/services/stockServices";
import { toast } from "sonner";

interface StockTableProps {
  refreshTrigger?: boolean;
  initialSearch?: string;
  search?: string;
  observation?: string;
  hideFilters?: boolean;
  page?: number;
  onPageChange?: (page: number) => void;
  onStatsUpdate?: (stats: { total: number; totalValue: number }) => void;
}

function getRowText(row: ExcelRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value == null) {
      continue;
    }

    const text = String(value).trim();
    if (text) {
      return text;
    }
  }

  return "";
}

function getRowNumber(row: ExcelRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "");
      const parsed = Number(normalized);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

export const StockTable = ({
  refreshTrigger,
  initialSearch = "",
  search,
  observation,
  hideFilters = false,
  page,
  onPageChange,
  onStatsUpdate,
}: StockTableProps) => {
  const [draftSearchTerm, setDraftSearchTerm] = useState(initialSearch);
  const [localSearchTerm, setLocalSearchTerm] = useState(initialSearch);
  const [draftObservationFilter, setDraftObservationFilter] = useState<string>("all");
  const [localObservationFilter, setLocalObservationFilter] = useState<string>("all");
  const [draftSupplierFilter, setDraftSupplierFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchTerm = search ?? localSearchTerm;
  const observationFilter = observation ?? localObservationFilter;
  const currentPage = page ?? pagination.page;

  const stockQuery = useQuery({
    queryKey: [
      "stock",
      currentPage,
      pagination.limit,
      searchTerm,
      observationFilter,
      supplierFilter,
    ],
    queryFn: () =>
      stockService.getStock({
        page: currentPage,
        limit: pagination.limit,
        search: searchTerm || undefined,
        observation:
          observationFilter === "all"
            ? undefined
            : (observationFilter as "with" | "without"),
        supplier: supplierFilter === "all" ? undefined : supplierFilter,
      }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const response = stockQuery.data as StockResponse | undefined;
  const devices = response?.data ?? [];
  const total = response?.total ?? 0;
  const totalValue = devices.reduce(
    (sum, device) => sum + (Number(device.valor_unitario ?? device.preco) || 0),
    0,
  );
  const loading = stockQuery.isLoading;
  const { refetch: refetchStock } = stockQuery;

  const fetchStock = useCallback(() => {
    refetchStock();
  }, [refetchStock]);

  useEffect(() => {
    if (stockQuery.isError) {
      console.error("Erro ao buscar estoque:", stockQuery.error);
      toast.error("Erro ao carregar estoque. Tente novamente.");
    }
  }, [stockQuery.error, stockQuery.isError]);

  useEffect(() => {
    if (onStatsUpdate && response) {
      onStatsUpdate({ total, totalValue });
    }
  }, [onStatsUpdate, response, total, totalValue]);

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchStock();
    }
  }, [fetchStock, refreshTrigger]);

  const suppliers = Array.from(new Set(devices.map(d => d.fornecedor)));

  const filteredDevices = devices;

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Relatório de Estoque", 14, 15);
    
    const tableData = filteredDevices.map((device) => [
      device.modelo,
      device.cor,
      device.imei,
      device.fornecedor,
      formatCurrency(device.preco),
      device.observacao || "-",
    ]);

    autoTable(doc, {
      head: [["Modelo",  "Cor", "IMEI", "Fornecedor", "Valor Unitário", "Observação"]],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`estoque-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportToExcel = () => {
    const worksheetData = filteredDevices.map((device) => ({
      "Modelo": device.modelo,
      "Cor": device.cor,
      "IMEI": device.imei,
      "Capacidade": device.capacidade,
      "Fornecedor": device.fornecedor,
      "Condição": device.condicao,
      "Valor Unitário": device.preco,
      "Data Entrada": device.dataEntrada,
      "Observação": device.observacao || "-",
    }));
    void exportRowsToWorkbook(
      worksheetData,
      `estoque-${new Date().toISOString().split("T")[0]}.xlsx`,
      "Estoque",
    );
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Use um arquivo .xlsx para importar o estoque.");
      event.target.value = "";
      return;
    }

    try {
      const rows = await importRowsFromWorkbook(file);

      for (const row of rows) {
        const modelo = getRowText(row, ["modelo", "aparelho"]);
        const imei = getRowText(row, ["imei"]);
        const valorUnitario = getRowNumber(row, ["valor_unitario", "preco"]);

        if (!modelo || !imei) {
          continue;
        }

        await stockService.createStock({
          imei,
          modelo,
          marca: getRowText(row, ["marca"]) || modelo.split(" ")[0] || "Sem marca",
          cor: getRowText(row, ["cor"]),
          capacidade: getRowText(row, ["capacidade"]),
          preco: valorUnitario,
          valor_unitario: valorUnitario,
          condicao: getRowText(row, ["condicao"]) || "Novo",
          dataEntrada:
            getRowText(row, ["data_entrada", "dataentrada"]) ||
            new Date().toISOString().split("T")[0],
          fornecedor: getRowText(row, ["fornecedor"]),
          observacao: getRowText(row, ["observacao"]),
        });
      }

      toast.success("Estoque importado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["stock"] });
    } catch (error) {
      console.error("Erro ao importar Excel:", error);
      toast.error("Erro ao importar arquivo. Verifique o formato.");
    } finally {
      event.target.value = "";
    }
  };

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
      return;
    }

    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const applyFilters = () => {
    setLocalSearchTerm(draftSearchTerm);
    setLocalObservationFilter(draftObservationFilter);
    setSupplierFilter(draftSupplierFilter);
    handlePageChange(1);
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Tem certeza que deseja remover este item do estoque?")) {
      try {
        await stockService.deleteStock(id);
        toast.success("Item removido com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["stock"] });
      } catch (error) {
        console.error("Erro ao remover item:", error);
        toast.error("Erro ao remover item.");
      }
    }
  };

  return (
    <Card className="min-w-0 shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0">
            <CardTitle>Estoque Atual</CardTitle>
            <CardDescription>
              {loading ? (
                "Carregando..."
              ) : (
                <>
                  {filteredDevices.length} de {total} aparelhos - 
                  Valor total: {formatCurrency(totalValue)}
                </>
              )}
            </CardDescription>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
            <Button 
              onClick={fetchStock} 
              variant="outline" 
              size="sm" 
              disabled={stockQuery.isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${stockQuery.isFetching ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button onClick={exportToPDF} variant="outline" size="sm" disabled={loading}>
              <FileDown className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button onClick={exportToExcel} variant="outline" size="sm" disabled={loading}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" size="sm" asChild disabled={loading}>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Importar
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleImportExcel}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </div>
        {!hideFilters && <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por modelo, cor, IMEI..."
              value={draftSearchTerm}
              onChange={(e) => setDraftSearchTerm(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyFilters();
                }
              }}
              className="pl-8"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select 
              value={draftSupplierFilter} 
              onValueChange={setDraftSupplierFilter}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Fornecedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Fornecedores</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={draftObservationFilter} 
              onValueChange={setDraftObservationFilter}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Observação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="with">Com Observação</SelectItem>
                <SelectItem value="without">Sem Observação</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" onClick={applyFilters} disabled={loading} className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col justify-center items-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Carregando estoque...</span>
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>IMEI</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Valor Unitário</TableHead>
                    <TableHead>Observação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        {searchTerm || supplierFilter !== "all" || observationFilter !== "all"
                          ? "Nenhum aparelho encontrado com os filtros aplicados"
                          : "Nenhum aparelho em estoque. Clique em 'Adicionar Estoque' para começar."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDevices.map((device) => (
                      <TableRow key={device.id || device.imei} className="hover:bg-muted/50">
                        <TableCell className="max-w-[220px] truncate font-medium">{device.modelo}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* <div 
                              className="w-3 h-3 rounded-full border"
                              style={{ backgroundColor: device.cor.toLowerCase() }}
                            /> */}
                            {device.cor}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{device.imei}</TableCell>
                        <TableCell>{device.capacidade}</TableCell>
                        <TableCell className="max-w-[180px] truncate">{device.fornecedor}</TableCell>
                        <TableCell className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(device.valor_unitario)}
                        </TableCell>
                        <TableCell>
                          {device.observacao ? (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-300">
                              <span className="block max-w-[180px] truncate">{device.observacao}</span>
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/produto/${device.id}`)}
                              title="Ver Detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/produto/edit/${device.id}`)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(device.id)}
                              title="Excluir"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => navigate(`/sell/${device.id}`)}
                              title="Vender"
                              className="bg-primary hover:bg-primary/90"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Paginação */}
            {total > pagination.limit && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {((currentPage - 1) * pagination.limit) + 1} a{" "}
                  {Math.min(currentPage * pagination.limit, total)} de{" "}
                  {total} itens
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Página {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage * pagination.limit >= total || loading}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
