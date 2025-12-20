import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { stockDevices } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { masks, validators } from "@/hooks/use-masks";
import stockService, { StockItem } from "@/services/stockServices";
const stockSchema = z.object({
  modelo: z.string().min(1, "Modelo é obrigatório").max(100, "Modelo deve ter no máximo 100 caracteres"),
  cor: z.string().min(1, "Cor é obrigatória").max(50, "Cor deve ter no máximo 50 caracteres"),
  fornecedor: z.string().min(1, "Fornecedor é obrigatório").max(100, "Fornecedor deve ter no máximo 100 caracteres"),
  imei: z.string().refine(val => validators.imei(val), "IMEI deve ter 15 dígitos"),
  observacao: z.string().max(500, "Observação deve ter no máximo 500 caracteres").optional(),
  valor_unitario: z.number().min(0.01, "Valor deve ser maior que zero"),
});

type StockFormData = z.infer<typeof stockSchema>;

const AddEditStock = () => {
  const navigate = useNavigate();
  const { imei } = useParams();
  const isEditing = !!imei;

  const existingDevice = isEditing ? stockDevices.find(d => d.imei === imei) : null;

  const form = useForm<StockFormData>({
    resolver: zodResolver(stockSchema),
    defaultValues: existingDevice ? {
      modelo: existingDevice.modelo,
      cor: existingDevice.cor,
      fornecedor: existingDevice.fornecedor,
      imei: existingDevice.imei,
      observacao: existingDevice.observacao,
      valor_unitario: existingDevice.valor_unitario,
    } : {
      modelo: "",
      cor: "",
      fornecedor: "",
      imei: "",
      observacao: "",
      valor_unitario: 0,
    },
  });

const onSubmit = async (data: StockItem) => {
  try {
    console.log(isEditing ? "Editando:" : "Adicionando:", data);

    if (isEditing) {
      console.log("editing");
      // await stockService.updateStock(data.id, data); // exemplo
    } else {
      stockDevices.push(data);
      await stockService.createStock(data);
    }

    toast({
      title: isEditing ? "Produto atualizado!" : "Produto adicionado!",
      description: `${data.modelo} foi ${
        isEditing ? "atualizado" : "adicionado"
      } ao estoque.`,
    });

    navigate("/");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Erro ao salvar produto:", error);

    toast({
      title: "Erro ao salvar produto",
      description:
        error?.response?.data?.message ||
        "Não foi possível salvar o produto. Tente novamente.",
      variant: "destructive",
    });
  }
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
            {isEditing ? "Editar Produto" : "Adicionar ao Estoque"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Atualize as informações do produto" : "Cadastre um novo produto no estoque"}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Editar Dados" : "Dados do Produto"}</CardTitle>
            <CardDescription>
              Preencha os campos abaixo com as informações do aparelho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="modelo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo</FormLabel>
                        <FormControl>
                          <Input placeholder="iPhone 13 128GB" {...field} />
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
                          <Input placeholder="PRETO" {...field} />
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

                    <FormField
                    control={form.control}
                    name="imei"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IMEI *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="359451183944323" 
                            {...field}
                            onChange={(e) => field.onChange(masks.imei(e.target.value))}
                            maxLength={15}
                            disabled={isEditing} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valor_unitario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Unitário (R$) *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0,00"
                            value={field.value ? masks.numberToCurrency(field.value) : ""}
                            onChange={(e) => field.onChange(masks.currencyToNumber(e.target.value))}
                          />
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
                        <Textarea
                          placeholder="Informações adicionais sobre o aparelho"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" className="w-full md:w-auto">
                    {isEditing ? "Salvar Alterações" : "Adicionar ao Estoque"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/")} className="w-full md:w-auto">
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddEditStock;
