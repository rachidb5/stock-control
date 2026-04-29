import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Package, User, DollarSign, Loader2 } from "lucide-react";
import { masks, validators } from "@/hooks/use-masks";
import { useEffect, useState } from "react";
import sellService from "@/services/sellService";
import stockService, { StockItem } from "@/services/stockServices";
import { useClientStore } from "@/stores/useClientStore";
import { toast } from "sonner";

const sellSchema = z.object({
  // Device info (from stock)
  aparelho: z.string().min(1, "Aparelho é obrigatório"),
  cor: z.string().min(1, "Cor é obrigatória"),
  imei: z.string().min(1, "IMEI é obrigatório"),
  fornecedor: z.string().min(1, "Fornecedor é obrigatório"),
  valor_compra: z.number().min(0, "Valor de compra deve ser positivo"),
  condicao: z.string().min(1, "Condição é obrigatória"),

  // Buyer info
  comprador: z.string().min(1, "Nome do comprador é obrigatório"),
  cpf_comprador: z
    .string()
    .refine((val) => validators.cpf(val), "CPF inválido"),
  telefone_comprador: z
    .string()
    .refine((val) => validators.phone(val), "Telefone inválido"),
  email_comprador: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),

  // Sale values
  preco_vista: z.number().min(0, "Valor deve ser positivo"),
  preco_cartao: z.number().min(0, "Valor deve ser positivo"),
  valor_entrega: z.number().min(0, "Valor deve ser positivo"),
  valor_capa_pelicula: z.number().min(0, "Valor deve ser positivo"),
  aparelho_recebido: z.boolean(),
  observacao: z.string().max(500).optional(),
});

type SellFormData = z.infer<typeof sellSchema>;
const toNum = (v: unknown): number => parseFloat(String(v ?? 0)) || 0;
const SellFromStock = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [device, setDevice] = useState<StockItem | null>(null);
  const clients = useClientStore((state) => state.clients);

  useEffect(() => {
    if (!id) return;

    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await stockService.getStockById(id);
        setDevice(response);
      } catch (error) {
        console.error("Erro ao buscar estoque:", error);
        toast.error("Erro ao carregar estoque. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const form = useForm<SellFormData>({
    resolver: zodResolver(sellSchema),
    defaultValues: {
      aparelho: "",
      cor: "",
      imei: "",
      fornecedor: "",
      valor_compra: 0,
      condicao: "",
      comprador: "",
      cpf_comprador: "",
      telefone_comprador: "",
      email_comprador: "",
      preco_vista: 0,
      preco_cartao: 0,
      valor_entrega: 0,
      valor_capa_pelicula: 0,
      aparelho_recebido: true,
      observacao: "",
    },
  });

  useEffect(() => {
    if (!device) return;

    form.reset({
      aparelho: device.modelo ?? "",
      cor: device.cor ?? "",
      imei: device.imei ?? "",
      fornecedor: device.fornecedor ?? "",
      valor_compra: toNum(device.valor_unitario),
      condicao: device.observacao?.toLowerCase().includes("quebrada")
        ? "Tela quebrada"
        : "Seminovo",
      comprador: "",
      cpf_comprador: "",
      telefone_comprador: "",
      email_comprador: "",
      preco_vista: 0,
      preco_cartao: 0,
      valor_entrega: 0,
      valor_capa_pelicula: 0,
      aparelho_recebido: true,
      observacao: device.observacao ?? "",
    });
  }, [device, form]);

  const watchPrecoVista = form.watch("preco_vista");
  const watchValorEntrega = form.watch("valor_entrega");
  const watchValorCapaPelicula = form.watch("valor_capa_pelicula");
  const valorTotalVenda =
    (watchPrecoVista || 0) +
    (watchValorEntrega || 0) +
    (watchValorCapaPelicula || 0);

  const onSubmit = async (data: SellFormData) => {
    if (!device?.id) {
      toast.error("O item de estoque não foi encontrado.");
      return;
    }

    try {
      setSubmitting(true);

      await sellService.createSale({
        data: new Date().toISOString().split("T")[0],
        aparelho: data.aparelho,
        cor: data.cor,
        condicao: data.condicao,
        imei: data.imei,
        fornecedor: data.fornecedor,
        valor_compra: data.valor_compra,
        comprador: data.comprador,
        numero_telefone: data.telefone_comprador,
        aparelho_recebido: data.aparelho_recebido,
        observacao: data.observacao ?? "",
        valor_recebido: 0,
        preco_vista: data.preco_vista,
        preco_cartao: data.preco_cartao,
        valor_entrega: data.valor_entrega,
        valor_capa_pelicula: data.valor_capa_pelicula,
        valor_total_venda: valorTotalVenda,
      });

      await stockService.deleteStock(device.id);

      toast.success("Venda registrada!", {
        description: `${data.aparelho} vendido para ${data.comprador} por ${new Intl.NumberFormat(
          "pt-BR",
          {
            style: "currency",
            currency: "BRL",
          },
        ).format(valorTotalVenda)}`,
      });
      navigate("/stock");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message || "Erro ao registrar venda.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      form.setValue("comprador", client.nome);
      form.setValue("cpf_comprador", masks.cpf(client.cpf));
      form.setValue("telefone_comprador", masks.phone(client.telefone));
      form.setValue("email_comprador", client.email);
    }
  };

  const currencyDisplay = (v: number | string | undefined) =>
    masks.numberToCurrency(toNum(v));

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-muted-foreground">Carregando item...</span>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6">
          <p className="text-muted-foreground">
            Dispositivo não encontrado no estoque.
          </p>
          <Button onClick={() => navigate("/stock")} className="mt-4">
            Voltar ao Estoque
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/stock")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Estoque
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Registrar Venda
          </h1>
          <p className="text-muted-foreground mt-1">
            Venda do produto em estoque
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Device Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Informações do Aparelho
                </CardTitle>
                <CardDescription>Dados do produto em estoque</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="aparelho"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-muted" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-muted" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imei"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IMEI</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-muted" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fornecedor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-muted" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valor_compra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor de Compra (R$)</FormLabel>
                      <FormControl>
                        <Input
                          value={currencyDisplay(field.value)}
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condicao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condição</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a condição" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Novo">Novo</SelectItem>
                          <SelectItem value="Seminovo">Seminovo</SelectItem>
                          <SelectItem value="Usado">Usado</SelectItem>
                          <SelectItem value="Recondicionado">
                            Recondicionado
                          </SelectItem>
                          <SelectItem value="Tela quebrada">
                            Tela quebrada
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Buyer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados do Comprador
                </CardTitle>
                <CardDescription>Informações do cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {clients.length > 0 && (
                  <div className="mb-4">
                    <FormLabel>Selecionar Cliente Existente</FormLabel>
                    <Select onValueChange={handleSelectClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um cliente ou preencha manualmente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.nome} - {masks.cpf(client.cpf)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="comprador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do comprador" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cpf_comprador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(masks.cpf(e.target.value))
                            }
                            maxLength={14}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefone_comprador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            {...field}
                            onChange={(e) =>
                              field.onChange(masks.phone(e.target.value))
                            }
                            maxLength={15}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email_comprador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sale Values */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Valores da Venda
                </CardTitle>
                <CardDescription>
                  Defina os valores da transação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="preco_vista"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço à Vista (R$) *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0,00"
                            value={
                              field.value
                                ? masks.numberToCurrency(field.value)
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                masks.currencyToNumber(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preco_cartao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço no Cartão (R$)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0,00"
                            value={
                              field.value
                                ? masks.numberToCurrency(field.value)
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                masks.currencyToNumber(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valor_entrega"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor da Entrega (R$)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0,00"
                            value={
                              field.value
                                ? masks.numberToCurrency(field.value)
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                masks.currencyToNumber(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valor_capa_pelicula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capa + Película (R$)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0,00"
                            value={
                              field.value
                                ? masks.numberToCurrency(field.value)
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                masks.currencyToNumber(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                  <span className="font-medium">Valor Total da Venda:</span>
                  <span className="text-2xl font-bold text-primary">
                    R${" "}
                    {valorTotalVenda.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <FormField
                  control={form.control}
                  name="aparelho_recebido"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Aparelho já recebido?
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Marque se o aparelho já foi entregue ao cliente
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observação</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informações adicionais sobre a venda"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" className="w-full md:w-auto" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Venda"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/stock")}
                className="w-full md:w-auto"
                disabled={submitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default SellFromStock;
