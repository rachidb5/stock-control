import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, ShoppingCart, User, DollarSign, CheckCircle2, XCircle, Loader2, Store } from "lucide-react";
import { soldDevices } from "@/data/mockData";
import sellService, { SoldDevice } from "@/services/sellService";
import { toast } from "sonner";

const SaleDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const localSale = id ? soldDevices.find((sale) => sale.id === id) : null;
  const [device, setDevice] = useState<SoldDevice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchSale = async () => {
      if (localSale) {
        setDevice(localSale);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await sellService.getSaleById(id);
        setDevice(data);
      } catch {
        toast.error("Erro ao carregar venda.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, [id, localSale, navigate]);

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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12 space-y-4 min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-muted-foreground">Carregando venda...</span>
      </div>
    );
  }

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
            <Button onClick={() => navigate(`/sale/edit/${device.id}`)}>
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
                {device.vendedor_nome && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vendedor responsável</p>
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <p className="text-lg">{device.vendedor_nome}</p>
                    </div>
                  </div>
                )}
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
                  <div className={`p-4 rounded-lg ${profit > 0 ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                    <p className="text-sm font-medium text-muted-foreground">Lucro</p>
                    <p className={`text-2xl font-bold ${profit > 0 ? "text-green-600" : "text-red-600"}`}>
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
          <Button onClick={() => navigate(`/sale/edit/${device.id}`)} size="lg">
            <Edit className="mr-2 h-4 w-4" />
            Editar Venda
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(localSale ? "/painel-comercial" : "/")}
            size="lg"
          >
            Voltar para Vendas
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SaleDetail;
