import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, ShoppingCart, User, DollarSign, CheckCircle2, XCircle } from "lucide-react";
import { soldDevices } from "@/data/mockData";

const SaleDetail = () => {
  const navigate = useNavigate();
  const { imei } = useParams();

  const device = soldDevices.find(d => d.imei === imei);

  if (!device) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Venda não encontrada</CardTitle>
            <CardDescription>A venda solicitada não foi encontrada.</CardDescription>
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const profit = device.valor_total_venda - device.valor_compra;

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
                <ShoppingCart className="h-8 w-8" />
                Detalhes da Venda
              </h1>
              <p className="text-muted-foreground mt-1">Informações completas da transação</p>
            </div>
            <Button onClick={() => navigate(`/sale/edit/${device.imei}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <Badge variant={device.aparelho_recebido ? "default" : "secondary"} className="text-base px-4 py-2">
              {device.aparelho_recebido ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Aparelho Recebido
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Aguardando Recebimento
                </>
              )}
            </Badge>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Data da Venda</p>
              <p className="text-lg font-semibold">{formatDate(device.data)}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Informações do Aparelho
                </CardTitle>
                <CardDescription>Dados do produto vendido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aparelho</p>
                  <p className="text-lg font-semibold">{device.aparelho}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cor</p>
                    <Badge variant="secondary" className="mt-1">{device.cor}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Condição</p>
                    <Badge variant="outline" className="mt-1">{device.condicao}</Badge>
                  </div>
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
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados do Comprador
                </CardTitle>
                <CardDescription>Informações do cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome</p>
                  <p className="text-lg font-semibold">{device.comprador}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p className="text-lg">{device.numero_telefone}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Informações Financeiras
              </CardTitle>
              <CardDescription>Valores e lucro da venda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor de Compra</p>
                    <p className="text-xl font-semibold">{formatCurrency(device.valor_compra)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Preço à Vista</p>
                    <p className="text-lg">{formatCurrency(device.preco_vista)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Preço no Cartão</p>
                    <p className="text-lg">{formatCurrency(device.preco_cartao)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Recebido</p>
                    <p className="text-xl font-semibold text-primary">{formatCurrency(device.valor_recebido)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Entrega</p>
                    <p className="text-lg">{formatCurrency(device.valor_entrega)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Capa e Película</p>
                    <p className="text-lg">{formatCurrency(device.valor_capa_pelicula)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm font-medium text-muted-foreground">Total da Venda</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(device.valor_total_venda)}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${profit > 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                    <p className="text-sm font-medium text-muted-foreground">Lucro</p>
                    <p className={`text-2xl font-bold ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(profit)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {device.observacao && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
                <CardDescription>Informações adicionais sobre a venda</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{device.observacao}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <Button onClick={() => navigate(`/sale/edit/${device.imei}`)} size="lg">
            <Edit className="mr-2 h-4 w-4" />
            Editar Venda
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} size="lg">
            Voltar para Vendas
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SaleDetail;
