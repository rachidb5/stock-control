import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Package } from "lucide-react";
import { stockDevices } from "@/data/mockData";

const StockDetail = () => {
  const navigate = useNavigate();
  const { imei } = useParams();

  const device = stockDevices.find(d => d.imei === imei);

  if (!device) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Produto não encontrado</CardTitle>
            <CardDescription>O produto solicitado não foi encontrado no estoque.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Package className="h-8 w-8" />
                Detalhes do Produto
              </h1>
              <p className="text-muted-foreground mt-1">Informações completas do item em estoque</p>
            </div>
            <Button onClick={() => navigate(`/stock/edit/${device.imei}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Aparelho</CardTitle>
              <CardDescription>Dados técnicos e identificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                <p className="text-lg font-semibold">{device.modelo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cor</p>
                <Badge variant="secondary" className="mt-1">{device.cor}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">IMEI</p>
                <p className="text-lg font-mono">{device.imei}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fornecedor</p>
                <p className="text-lg">{device.fornecedor}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Financeiras</CardTitle>
              <CardDescription>Valores e estoque</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Unitário</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(device.valor_unitario)}</p>
              </div>
              {device.valor_total_estoque !== null && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Total em Estoque</p>
                  <p className="text-xl font-semibold">{formatCurrency(device.valor_total_estoque)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {device.observacao && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
                <CardDescription>Informações adicionais sobre o aparelho</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{device.observacao}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <Button onClick={() => navigate(`/stock/edit/${device.imei}`)} size="lg">
            <Edit className="mr-2 h-4 w-4" />
            Editar Produto
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} size="lg">
            Voltar para Estoque
          </Button>
        </div>
      </main>
    </div>
  );
};

export default StockDetail;
