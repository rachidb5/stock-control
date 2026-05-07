import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Loader2, Package } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import stockService, { StockItem } from "@/services/stockServices";
import { toast } from "sonner";

const PRODUCT_PHOTO_PLACEHOLDER = "/placeholder.svg";

const StockDetail = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const [device, setDevice] = useState<StockItem | null>(null);
  const fetchItem = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response: StockItem = await stockService.getStockById(id);
      setDevice(response);
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
      toast.error("Erro ao carregar estoque. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  if (!device && loading === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Produto não encontrado</CardTitle>
            <CardDescription>
              O produto solicitado não foi encontrado no estoque.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)} className="w-full">
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-muted-foreground">Carregando item...</span>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 w-full justify-start sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
                <Package className="h-8 w-8" />
                Detalhes do Produto
              </h1>
              <p className="text-muted-foreground mt-1">
                Informações completas do item em estoque
              </p>
            </div>
            <Button onClick={() => navigate(`/produto/edit/${device.id}`)} className="w-full sm:w-auto">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Foto do Produto</CardTitle>
              <CardDescription>Registro visual do aparelho</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src={device.foto || PRODUCT_PHOTO_PLACEHOLDER}
                alt={
                  device.foto
                    ? `Foto de ${device.modelo}`
                    : "Produto sem foto cadastrada"
                }
                className="h-72 w-full rounded-md border object-cover"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Aparelho</CardTitle>
              <CardDescription>Dados técnicos e identificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Modelo
                </p>
                <p className="text-lg font-semibold">{device.modelo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cor</p>
                <Badge variant="secondary" className="mt-1">
                  {device.cor}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  IMEI
                </p>
                <p className="text-lg font-mono">{device.imei}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Fornecedor
                </p>
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
                <p className="text-sm font-medium text-muted-foreground">
                  Valor Unitário
                </p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(device.valor_unitario)}
                </p>
              </div>
              {/* {device.valor_total_estoque !== null && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Valor Total em Estoque
                  </p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(device.valor_total_estoque)}
                  </p>
                </div>
              )} */}
            </CardContent>
          </Card>

          {device.observacao && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
                <CardDescription>
                  Informações adicionais sobre o aparelho
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">
                  {device.observacao}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => navigate(`/produto/edit/${device.id}`)}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar Produto
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)} size="lg" className="w-full sm:w-auto">
            Voltar para Estoque
          </Button>
        </div>
      </main>
    </div>
  );
};

export default StockDetail;
