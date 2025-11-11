import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { soldDevices } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

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

const AddEditSale = () => {
  const navigate = useNavigate();
  const { imei } = useParams();
  const isEditing = !!imei;

  const existingDevice = isEditing ? soldDevices.find(d => d.imei === imei) : null;

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: existingDevice || {
      data: new Date().toISOString().split('T')[0],
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

  const onSubmit = (data: SaleFormData) => {
    console.log(isEditing ? "Editando:" : "Adicionando:", data);
    toast({
      title: isEditing ? "Venda atualizada!" : "Venda registrada!",
      description: `Venda de ${data.aparelho} foi ${isEditing ? "atualizada" : "registrada"}.`,
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? "Editar Venda" : "Registrar Nova Venda"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Atualize as informações da venda" : "Cadastre uma nova venda"}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
                        <Textarea placeholder="Informações adicionais" {...field} />
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
                          <Input placeholder="+55 (11) 98765-4321" {...field} />
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

            <div className="flex gap-4">
              <Button type="submit" size="lg">
                {isEditing ? "Salvar Alterações" : "Registrar Venda"}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => navigate("/")}>
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
