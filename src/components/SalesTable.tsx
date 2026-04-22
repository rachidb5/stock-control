import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle2, XCircle, Eye, Edit, FileDown, Upload, FileSpreadsheet, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { sellService, SoldDevice } from "@/services/sellService";
import { toast } from "sonner";

export const SalesTable = () => {
  const [devices, setDevices] = useState<SoldDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const response = await sellService.getSales({
        limit: 1000,
        search: searchTerm || undefined,
      });
      setDevices(response.data);
    } catch {
      toast.error("Erro ao carregar vendas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const filteredDevices = devices.filter((device) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && device.aparelho_recebido) ||
      (statusFilter === "pending" && !device.aparelho_recebido);

    const matchesCondition =
      conditionFilter === "all" || device.condicao === conditionFilter;

    const deviceDate = new Date(device.data + "T00:00:00");
    const matchesStartDate = !startDate || deviceDate >= new Date(startDate + "T00:00:00");
    const matchesEndDate = !endDate || deviceDate <= new Date(endDate + "T00:00:00");

    return matchesStatus && matchesCondition && matchesStartDate && matchesEndDate;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      Novo: { variant: "default", className: "bg-success text-success-foreground" },
      Seminovo: { variant: "secondary", className: "bg-primary/10 text-primary" },
      Usado: { variant: "outline", className: "bg-warning/10 text-warning border-warning" },
      Recondicionado: { variant: "outline", className: "bg-accent/10 text-accent border-accent" },
    };
    const config = variants[condition] || variants.Usado;
    return <Badge variant={config.variant} className={config.className}>{condition}</Badge>;
  };

  const calculateProfit = (device: SoldDevice) => {
    if (!device.aparelho_recebido) return 0;
    return device.valor_total_venda - device.valor_compra;
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de Vendas", 14, 15);
    const tableData = filteredDevices.map((device) => [
      device.aparelho,
      device.cor,
      device.imei,
      device.condicao,
      formatCurrency(device.valor_total_venda),
      formatCurrency(device.valor_compra),
      formatCurrency(calculateProfit(device)),
      device.aparelho_recebido ? "Concluído" : "Pendente",
      formatDate(device.data),
    ]);
    autoTable(doc, {
      head: [["Aparelho", "Cor", "IMEI", "Condição", "Valor Venda", "Valor Custo", "Lucro", "Status", "Data"]],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    doc.save(`vendas-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportToExcel = () => {
    const worksheetData = filteredDevices.map((device) => ({
      "Aparelho": device.aparelho,
      "Cor": device.cor,
      "IMEI": device.imei,
      "Condição": device.condicao,
      "Comprador": device.comprador,
      "Telefone": device.numero_telefone,
      "Valor de Venda": device.valor_total_venda,
      "Valor de Compra": device.valor_compra,
      "Lucro": calculateProfit(device),
      "Status": device.aparelho_recebido ? "Concluído" : "Pendente",
      "Data": formatDate(device.data),
      "Observação": device.observacao,
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas");
    XLSX.writeFile(workbook, `vendas-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log("Dados importados:", jsonData);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Vendas Realizadas</CardTitle>
            <CardDescription>Histórico de aparelhos vendidos</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchSales} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button onClick={exportToExcel} variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer flex items-center">
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
              placeholder="Buscar por aparelho, comprador ou IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              type="date"
              placeholder="Data inicial"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              placeholder="Data final"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Condição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Condições</SelectItem>
                <SelectItem value="Novo">Novo</SelectItem>
                <SelectItem value="Seminovo">Seminovo</SelectItem>
                <SelectItem value="Usado">Usado</SelectItem>
                <SelectItem value="Recondicionado">Recondicionado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col justify-center items-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Carregando vendas...</span>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Aparelho</TableHead>
                  <TableHead>Condição</TableHead>
                  <TableHead>Comprador</TableHead>
                  <TableHead>Valor Compra</TableHead>
                  <TableHead>Valor Venda</TableHead>
                  <TableHead>Lucro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      Nenhuma venda encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices.map((device) => {
                    const profit = calculateProfit(device);
                    return (
                      <TableRow key={device.id}>
                        <TableCell className="font-medium">
                          {formatDate(device.data)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{device.aparelho}</div>
                            <div className="text-xs text-muted-foreground">{device.cor}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getConditionBadge(device.condicao)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{device.comprador}</div>
                            <div className="text-xs text-muted-foreground">{device.numero_telefone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-destructive font-semibold">
                          {formatCurrency(device.valor_compra)}
                        </TableCell>
                        <TableCell className="text-success font-semibold">
                          {device.aparelho_recebido ? formatCurrency(device.valor_total_venda) : "-"}
                        </TableCell>
                        <TableCell>
                          {device.aparelho_recebido ? (
                            <span className={profit >= 0 ? "text-success font-semibold" : "text-destructive font-semibold"}>
                              {formatCurrency(profit)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {device.aparelho_recebido ? (
                            <Badge variant="default" className="bg-success text-success-foreground">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Concluído
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                              <XCircle className="w-3 h-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/sale/${device.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/sale/edit/${device.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
