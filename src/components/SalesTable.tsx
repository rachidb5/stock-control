import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SoldDevice } from "@/data/mockData";
import { Search, CheckCircle2, XCircle, Eye, Edit, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface SalesTableProps {
  devices: SoldDevice[];
}

export const SalesTable = ({ devices }: SalesTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.aparelho.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.comprador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.imei.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && device.aparelho_recebido) ||
      (statusFilter === "pending" && !device.aparelho_recebido);

    const matchesCondition =
      conditionFilter === "all" || device.condicao === conditionFilter;

    const deviceDate = new Date(device.data);
    const matchesStartDate = !startDate || deviceDate >= new Date(startDate);
    const matchesEndDate = !endDate || deviceDate <= new Date(endDate);

    return matchesSearch && matchesStatus && matchesCondition && matchesStartDate && matchesEndDate;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
      new Date(device.data).toLocaleDateString("pt-BR"),
      device.aparelho,
      device.cor,
      device.condicao,
      device.comprador,
      formatCurrency(device.valor_compra),
      device.aparelho_recebido ? formatCurrency(device.valor_total_venda) : "-",
      device.aparelho_recebido ? formatCurrency(calculateProfit(device)) : "-",
      device.aparelho_recebido ? "Concluído" : "Pendente",
    ]);

    autoTable(doc, {
      head: [["Data", "Aparelho", "Cor", "Condição", "Comprador", "Valor Compra", "Valor Venda", "Lucro", "Status"]],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`vendas-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Vendas Realizadas</CardTitle>
            <CardDescription>Histórico de aparelhos vendidos</CardDescription>
          </div>
          <Button onClick={exportToPDF} variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
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
            <div>
              <Input
                type="date"
                placeholder="Data inicial"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="Data final"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
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
        <div className="rounded-md border">
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
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    Nenhuma venda encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredDevices.map((device, index) => {
                  const profit = calculateProfit(device);
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {new Date(device.data).toLocaleDateString("pt-BR")}
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
                            onClick={() => navigate(`/sale/${device.imei}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/sale/edit/${device.imei}`)}
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
      </CardContent>
    </Card>
  );
};
