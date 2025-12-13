import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StockDevice } from "@/data/mockData";
import { Search, Eye, Edit, FileDown, Upload, FileSpreadsheet, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface StockTableProps {
  devices: StockDevice[];
}

export const StockTable = ({ devices }: StockTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [observationFilter, setObservationFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const navigate = useNavigate();

  const suppliers = Array.from(new Set(devices.map(d => d.fornecedor)));

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.cor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.imei.includes(searchTerm);

    const matchesObservation =
      observationFilter === "all" ||
      (observationFilter === "with" && device.observacao) ||
      (observationFilter === "without" && !device.observacao);

    const matchesSupplier =
      supplierFilter === "all" || device.fornecedor === supplierFilter;

    return matchesSearch && matchesObservation && matchesSupplier;
  });

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-";
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
      formatCurrency(device.valor_unitario),
      device.observacao || "-",
    ]);

    autoTable(doc, {
      head: [["Modelo", "Cor", "IMEI", "Fornecedor", "Valor Unitário", "Observação"]],
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
      "Fornecedor": device.fornecedor,
      "Valor Unitário": device.valor_unitario,
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
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log("Dados importados:", jsonData);
      // Aqui você pode processar os dados importados
      // Por exemplo, atualizar o estado ou enviar para o backend
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Estoque Atual</CardTitle>
            <CardDescription>Aparelhos disponíveis para venda</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button onClick={exportToExcel} variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" size="sm" asChild>
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
              placeholder="Buscar por modelo, cor ou IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
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
            <Select value={observationFilter} onValueChange={setObservationFilter}>
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modelo</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>IMEI</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Valor Unitário</TableHead>
                <TableHead>Observação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhum aparelho encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredDevices.map((device, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{device.modelo}</TableCell>
                    <TableCell>{device.cor}</TableCell>
                    <TableCell className="font-mono text-sm">{device.imei}</TableCell>
                    <TableCell>{device.fornecedor}</TableCell>
                    <TableCell className="font-semibold text-success">
                      {formatCurrency(device.valor_unitario)}
                    </TableCell>
                    <TableCell>
                      {device.observacao ? (
                        <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning">
                          {device.observacao}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/stock/${device.imei}`)}
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/stock/edit/${device.imei}`)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
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
      </CardContent>
    </Card>
  );
};
