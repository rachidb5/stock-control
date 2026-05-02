import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2 } from "lucide-react";
import { soldDevices } from "@/data/mockData";
import sellService from "@/services/sellService";
import { selectCurrentUser, useSessionStore } from "@/stores/useSessionStore";
import { toast } from "sonner";

const saleSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  aparelho: z.string().min(1, "Aparelho é obrigatório").max(100),
  cor: z.string().min(1, "Cor é obrigatória").max(50),
  condicao: z.string().min(1, "Condição é obrigatória").max(50),
  imei: z.string().min(1, "IMEI é obrigatório").max(50),
  fornecedor: z.string().min(1, "Fornecedor é obrigatório").max(100),
  valor_compra: z.number().min(0),
  comprador: z.string().min(1, "Comprador é obrigatório").max(100),
  numero_telefone: z.string().min(1, "Telefone é obrigatório").max(20),
  aparelho_recebido: z.boolean(),
  observacao: z.string().max(500),
  valor_recebido: z.number().min(0),
  preco_vista: z.number().min(0),
  preco_cartao: z.number().min(0),
  valor_entrega: z.number().min(0),
  valor_capa_pelicula: z.number().min(0),
  valor_total_venda: z.number().min(0),
});

type SaleFormData = z.infer<typeof saleSchema>;
const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const AddEditSale = () => {
  const navigate = useNavigate();
  const currentUser = useSessionStore(selectCurrentUser);
  const { id } = useParams();
  const isEditing = !!id;
  const localSale = id ? soldDevices.find((sale) => sale.id === id) : null;
  const [fetching, setFetching] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      data: new Date().toISOString().split("T")[0],
      aparelho: "",
      cor: "",
      condicao: "",
      imei: "",
      fornecedor: "",
      valor_compra: 0,
      comprador: "",
      numero_telefone: "",
      aparelho_recebido: false,
      observacao: "",
      valor_recebido: 0,
      preco_vista: 0,
      preco_cartao: 0,
      valor_entrega: 0,
      valor_capa_pelicula: 0,
      valor_total_venda: 0,
    },
  });

  useEffect(() => {
    if (!isEditing || !id) return;
    const fetchSale = async () => {
      if (localSale) {
        form.reset({
          data: localSale.data.split("T")[0],
          aparelho: localSale.aparelho,
          cor: localSale.cor,
          condicao: localSale.condicao,
          imei: localSale.imei,
          fornecedor: localSale.fornecedor,
          valor_compra: toNumber(localSale.valor_compra),
          comprador: localSale.comprador,
          numero_telefone: localSale.numero_telefone,
          aparelho_recebido: localSale.aparelho_recebido,
          observacao: localSale.observacao || "",
          valor_recebido: toNumber(localSale.valor_recebido),
          preco_vista: toNumber(localSale.preco_vista),
          preco_cartao: toNumber(localSale.preco_cartao),
          valor_entrega: toNumber(localSale.valor_entrega),
          valor_capa_pelicula: toNumber(localSale.valor_capa_pelicula),
          valor_total_venda: toNumber(localSale.valor_total_venda),
        });
        setFetching(false);
        return;
      }

      try {
        setFetching(true);
        const sale = await sellService.getSaleById(id);
        form.reset({
          data: sale.data.split("T")[0],
          aparelho: sale.aparelho,
          cor: sale.cor,
          condicao: sale.condicao,
          imei: sale.imei,
          fornecedor: sale.fornecedor,
          valor_compra: toNumber(sale.valor_compra),
          comprador: sale.comprador,
          numero_telefone: sale.numero_telefone,
          aparelho_recebido: sale.aparelho_recebido,
          observacao: sale.observacao || "",
          valor_recebido: toNumber(sale.valor_recebido),
          preco_vista: toNumber(sale.preco_vista),
          preco_cartao: toNumber(sale.preco_cartao),
          valor_entrega: toNumber(sale.valor_entrega),
          valor_capa_pelicula: toNumber(sale.valor_capa_pelicula),
          valor_total_venda: toNumber(sale.valor_total_venda),
        });
      } catch {
        toast.error("Erro ao carregar venda.");
        navigate("/");
      } finally {
        setFetching(false);
      }
    };
    fetchSale();
  }, [id, isEditing, form, localSale, navigate]);

  const onSubmit = async (data: SaleFormData) => {
    try {
      setSubmitting(true);
      if (isEditing && id) {
        if (localSale) {
          Object.assign(localSale, data);
        } else {
          await sellService.updateSale(id, data);
        }
        toast.success("Venda atualizada!", {
          description: `Venda de ${data.aparelho} foi atualizada.`,
        });
      } else {
        await sellService.createSale({
          ...data,
          vendedor_id: currentUser.id,
          vendedor_nome: currentUser.name,
          canal_venda: "Venda manual",
        });
        toast.success("Venda registrada!", {
          description: `Venda de ${data.aparelho} foi registrada.`,
        });
      }
      navigate("/produtos?tab=vendas");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message || "Erro ao salvar venda.");
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col justify-center items-center py-12 space-y-4 min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-muted-foreground">Carregando venda...</span>
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
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {isEditing ? "Editar Venda" : "Registrar Nova Venda"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Atualize as informações da venda" : "Cadastre uma nova venda"}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Aparelho</CardTitle>
                <CardDescription>Dados do produto vendido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="data"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data da Venda</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aparelho"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aparelho</FormLabel>
                        <FormControl>
                          <Input placeholder="iPhone 15 Pro Max" {...field} />
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
                          <Input placeholder="Preto" {...field} />
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
                        <FormControl>
                          <Input placeholder="Novo" {...field} />
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
                          <Input placeholder="355678901234567" {...field} disabled={isEditing} />
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
                          <Input placeholder="Nome do fornecedor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observação</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Informações adicionais" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dados do Comprador</CardTitle>
                <CardDescription>Informações do cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="comprador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Comprador</FormLabel>
                        <FormControl>
                          <Input placeholder="João Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numero_telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 98765-4321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="aparelho_recebido"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Aparelho Recebido</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          O aparelho já foi recebido do fornecedor?
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valores Financeiros</CardTitle>
                <CardDescription>Informações de preço e custos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="valor_compra"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor de Compra (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preco_vista"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço à Vista (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valor_recebido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Recebido (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                        <FormLabel>Valor Entrega (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                        <FormLabel>Capa e Película (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valor_total_venda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total da Venda (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  isEditing ? "Salvar Alterações" : "Registrar Venda"
                )}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)} disabled={submitting} className="w-full sm:w-auto">
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default AddEditSale;
