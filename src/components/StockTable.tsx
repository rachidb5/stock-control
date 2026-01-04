// StockTable.tsx (versão atualizada)
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Edit, FileDown, Upload, FileSpreadsheet, ShoppingCart, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { stockService, StockItem, StockResponse } from "@/services/stockServices";
import { toast } from "sonner";

interface StockTableProps {
  refreshTrigger?: boolean;
  initialSearch?: string;
  onStatsUpdate?: (stats: { total: number; totalValue: number }) => void;
}

export const StockTable = ({ refreshTrigger, initialSearch = "", onStatsUpdate }: StockTableProps) => {
  const [devices, setDevices] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [observationFilter, setObservationFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalValue: 0
  });
  const navigate = useNavigate();

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined
      };

      const response: StockResponse = await stockService.getStock(params);
      setDevices(response.data);
      console.log(response)
      // Calcular valor total do estoque
      const totalValue = response.data.reduce((sum, device) => sum + (device.preco || 0), 0);
      
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalValue
      }));

      // Passar estatísticas para o componente pai
      if (onStatsUpdate) {
        onStatsUpdate({
          total: response.total,
          totalValue
        });
      }
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
      toast.error("Erro ao carregar estoque. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, onStatsUpdate]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock, refreshTrigger]);

  const suppliers = Array.from(new Set(devices.map(d => d.fornecedor)));

  const filteredDevices = devices.filter((device) => {
    const matchesObservation =
      observationFilter === "all" ||
      (observationFilter === "with" && device.observacao) ||
      (observationFilter === "without" && !device.observacao);

    const matchesSupplier =
      supplierFilter === "all" || device.fornecedor === supplierFilter;

    return matchesObservation && matchesSupplier;
  });

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

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque");
    
    XLSX.writeFile(workbook, `estoque-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Processar dados importados
        for (const item of jsonData) {
          const stockItem: StockItem = {
            id: item.id,
            imei: item.imei || "",
            modelo: item.modelo || "",
            cor: item.cor || "",
            capacidade: item.capacidade || "",
            preco: item.preco || item.valor_unitario || 0,
            condicao: item.condicao || "Novo",
            dataEntrada: item.dataEntrada || new Date().toISOString().split('T')[0],
            fornecedor: item.fornecedor || "",
            observacao: item.observacao || item.observacao || "",
          };
          
          await stockService.createStock(stockItem);
        }
        
        toast.success("Estoque importado com sucesso!");
        fetchStock();
      } catch (error) {
        console.error("Erro ao importar Excel:", error);
        toast.error("Erro ao importar arquivo. Verifique o formato.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (imei: string) => {
    if (window.confirm("Tem certeza que deseja remover este item do estoque?")) {
      try {
        await stockService.deleteStock(imei);
        toast.success("Item removido com sucesso!");
        fetchStock();
      } catch (error) {
        console.error("Erro ao remover item:", error);
        toast.error("Erro ao remover item.");
      }
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Estoque Atual</CardTitle>
            <CardDescription>
              {loading ? (
                "Carregando..."
              ) : (
                <>
                  {filteredDevices.length} de {pagination.total} aparelhos - 
                  Valor total: {formatCurrency(pagination.totalValue)}
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={fetchStock} 
              variant="outline" 
              size="sm" 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
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
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </div>
        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por modelo, cor, IMEI..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select 
              value={supplierFilter} 
              onValueChange={setSupplierFilter}
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
              value={observationFilter} 
              onValueChange={setObservationFilter}
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
          </div>
        </div>
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
                        <TableCell className="font-medium">{device.modelo}</TableCell>
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
                        <TableCell>{device.fornecedor}</TableCell>
                        <TableCell className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(device.valor_unitario)}
                        </TableCell>
                        <TableCell>
                          {device.observacao ? (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-300">
                              {device.observacao}
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
                              onClick={() => navigate(`/stock/${device.id}`)}
                              title="Ver Detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/stock/edit/${device.id}`)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(device.imei)}
                              title="Excluir"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              X
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => navigate(`/sell/${device.imei}`)}
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
            {pagination.total > pagination.limit && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                  {pagination.total} itens
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Página {pagination.page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page * pagination.limit >= pagination.total || loading}
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