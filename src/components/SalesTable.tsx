import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SoldDevice } from "@/data/mockData";
import { Search, CheckCircle2, XCircle, Eye, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SalesTableProps {
  devices: SoldDevice[];
}

export const SalesTable = ({ devices }: SalesTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredDevices = devices.filter(
    (device) =>
      device.aparelho.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.comprador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.imei.includes(searchTerm)
  );

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

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Vendas Realizadas</CardTitle>
        <CardDescription>Histórico de aparelhos vendidos</CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por aparelho, comprador ou IMEI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
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
