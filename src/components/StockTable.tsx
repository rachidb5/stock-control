import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StockDevice } from "@/data/mockData";
import { Search, Eye, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StockTableProps {
  devices: StockDevice[];
}

export const StockTable = ({ devices }: StockTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredDevices = devices.filter(
    (device) =>
      device.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.cor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.imei.includes(searchTerm)
  );

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Estoque Atual</CardTitle>
        <CardDescription>Aparelhos disponíveis para venda</CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por modelo, cor ou IMEI..."
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
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/stock/edit/${device.imei}`)}
                        >
                          <Edit className="h-4 w-4" />
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
