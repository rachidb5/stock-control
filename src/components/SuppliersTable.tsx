import { useEffect, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { masks, validators } from "@/hooks/use-masks";
import supplierService, {
  Supplier,
  SupplierInput,
  SupplierResponse,
} from "@/services/supplierService";
import {
  Building2,
  Edit,
  Factory,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

interface SupplierFormErrors {
  razao_social?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

const emptySupplierForm: SupplierInput = {
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  email: "",
  telefone: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  data_cadastro: new Date().toISOString().split("T")[0],
};

export function SuppliersTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draftSearchTerm, setDraftSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<SupplierInput>(emptySupplierForm);
  const [errors, setErrors] = useState<SupplierFormErrors>({});

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", pagination.page, pagination.limit, searchTerm],
    queryFn: () =>
      supplierService.getSuppliers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const response = suppliersQuery.data as SupplierResponse | undefined;
  const suppliers = response?.data ?? [];
  const total = response?.total ?? 0;
  const loading = suppliersQuery.isLoading;
  const statesCount = new Set(
    suppliers.map((supplier) => supplier.estado).filter(Boolean),
  ).size;

  useEffect(() => {
    if (suppliersQuery.isError) {
      toast({
        title: "Erro ao carregar fornecedores",
        description:
          suppliersQuery.error instanceof Error
            ? suppliersQuery.error.message
            : "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  }, [suppliersQuery.error, suppliersQuery.isError, toast]);

  const handleInputChange = (field: keyof SupplierInput, value: string) => {
    const maskMap: Partial<Record<keyof SupplierInput, (current: string) => string>> = {
      cnpj: masks.cnpj,
      telefone: masks.phone,
      cep: masks.cep,
    };

    const nextValue = maskMap[field] ? maskMap[field]?.(value) ?? value : value;

    setFormData((prev) => ({ ...prev, [field]: nextValue }));

    if (errors[field as keyof SupplierFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const openCreateDialog = () => {
    setEditingSupplier(null);
    setFormData({
      ...emptySupplierForm,
      data_cadastro: new Date().toISOString().split("T")[0],
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      ...supplier,
      cnpj: masks.cnpj(supplier.cnpj),
      telefone: masks.phone(supplier.telefone),
      cep: masks.cep(supplier.cep),
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const applySearch = () => {
    setSearchTerm(draftSearchTerm);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const validateForm = () => {
    const nextErrors: SupplierFormErrors = {};

    if (!formData.razao_social.trim()) {
      nextErrors.razao_social = "Razao social e obrigatoria";
    }

    if (!validators.cnpj(formData.cnpj)) {
      nextErrors.cnpj = "CNPJ invalido";
    }

    if (!validators.email(formData.email)) {
      nextErrors.email = "Email invalido";
    }

    if (!validators.phone(formData.telefone)) {
      nextErrors.telefone = "Telefone invalido";
    }

    if (!formData.cidade.trim()) {
      nextErrors.cidade = "Cidade e obrigatoria";
    }

    if (formData.estado.trim().length !== 2) {
      nextErrors.estado = "Informe a UF com 2 letras";
    }

    if (!validators.cep(formData.cep)) {
      nextErrors.cep = "CEP invalido";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Revise o formulario",
        description: "Corrija os campos destacados antes de salvar o fornecedor.",
        variant: "destructive",
      });
      return;
    }

    const payload: SupplierInput = {
      razao_social: formData.razao_social,
      nome_fantasia: formData.nome_fantasia,
      cnpj: formData.cnpj.replace(/\D/g, ""),
      email: formData.email,
      telefone: formData.telefone.replace(/\D/g, ""),
      endereco: formData.endereco,
      cidade: formData.cidade,
      estado: formData.estado.toUpperCase(),
      cep: formData.cep.replace(/\D/g, ""),
      data_cadastro: formData.data_cadastro,
    };

    try {
      if (editingSupplier) {
        await supplierService.updateSupplier(editingSupplier.id, payload);
        toast({
          title: "Fornecedor atualizado",
          description: `${payload.razao_social} foi atualizado com sucesso.`,
        });
      } else {
        await supplierService.createSupplier(payload);
        toast({
          title: "Fornecedor criado",
          description: `${payload.razao_social} foi adicionado a base.`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar fornecedor",
        description:
          error instanceof Error ? error.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    if (
      !window.confirm(
        `Deseja remover ${supplier.razao_social} da base de fornecedores?`,
      )
    ) {
      return;
    }

    try {
      await supplierService.deleteSupplier(supplier.id);
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Fornecedor removido",
        description: `${supplier.razao_social} foi excluido com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao remover fornecedor",
        description:
          error instanceof Error ? error.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  };

  const formatCnpj = (cnpj: string) =>
    cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");

  const formatPhone = (phone: string) =>
    phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");

  const formatDate = (date: string) => {
    const [year, month, day] = date.split("-");
    return year && month && day ? `${day}/${month}/${year}` : date;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">Fornecedores</h2>
          <p className="text-muted-foreground">
            Gerencie parceiros comerciais, contatos e dados fiscais.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo fornecedor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de fornecedores</CardDescription>
            <CardTitle className="text-3xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Estados atendidos</CardDescription>
            <CardTitle className="text-3xl">{statesCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Base filtrada</CardDescription>
            <CardTitle className="text-3xl">{suppliers.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-primary" />
                Fornecedores Cadastrados
              </CardTitle>
              <CardDescription>
                Busque, edite e remova fornecedores diretamente desta pagina.
              </CardDescription>
            </div>
            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
              <div className="relative w-full md:w-[340px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por razao, fantasia, email, telefone ou CNPJ..."
                  value={draftSearchTerm}
                  onChange={(event) => setDraftSearchTerm(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      applySearch();
                    }
                  }}
                  className="pl-8"
                />
              </div>
              <Button type="button" onClick={applySearch} disabled={loading} className="w-full md:w-auto">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Localidade</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      {loading
                        ? "Carregando fornecedores..."
                        : "Nenhum fornecedor encontrado com os filtros atuais."}
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="max-w-[240px] truncate font-medium">{supplier.razao_social}</div>
                          {supplier.nome_fantasia && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              <span className="block max-w-[220px] truncate">{supplier.nome_fantasia}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatCnpj(supplier.cnpj)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {formatPhone(supplier.telefone)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="block max-w-[220px] truncate">{supplier.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {supplier.cidade}, {supplier.estado}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(supplier.data_cadastro)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(supplier)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(supplier)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {total > pagination.limit && (
            <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-sm text-muted-foreground">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                {Math.min(pagination.page * pagination.limit, total)} de {total} fornecedores
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((current) => ({
                      ...current,
                      page: current.page - 1,
                    }))
                  }
                  disabled={pagination.page === 1 || loading}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Pagina {pagination.page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((current) => ({
                      ...current,
                      page: current.page + 1,
                    }))
                  }
                  disabled={pagination.page * pagination.limit >= total || loading}
                >
                  Proxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Editar fornecedor" : "Novo fornecedor"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados principais para manter sua rede de fornecedores atualizada.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="razao_social">Razao social</Label>
              <Input
                id="razao_social"
                value={formData.razao_social}
                onChange={(event) => handleInputChange("razao_social", event.target.value)}
                className={errors.razao_social ? "border-destructive" : ""}
              />
              {errors.razao_social && (
                <p className="text-sm text-destructive">{errors.razao_social}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome_fantasia">Nome fantasia</Label>
              <Input
                id="nome_fantasia"
                value={formData.nome_fantasia}
                onChange={(event) => handleInputChange("nome_fantasia", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(event) => handleInputChange("cnpj", event.target.value)}
                maxLength={18}
                className={errors.cnpj ? "border-destructive" : ""}
              />
              {errors.cnpj && <p className="text-sm text-destructive">{errors.cnpj}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) => handleInputChange("email", event.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(event) => handleInputChange("telefone", event.target.value)}
                maxLength={15}
                className={errors.telefone ? "border-destructive" : ""}
              />
              {errors.telefone && (
                <p className="text-sm text-destructive">{errors.telefone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(event) => handleInputChange("cep", event.target.value)}
                maxLength={9}
                className={errors.cep ? "border-destructive" : ""}
              />
              {errors.cep && <p className="text-sm text-destructive">{errors.cep}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="endereco">Endereco</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(event) => handleInputChange("endereco", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(event) => handleInputChange("cidade", event.target.value)}
                className={errors.cidade ? "border-destructive" : ""}
              />
              {errors.cidade && <p className="text-sm text-destructive">{errors.cidade}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">UF</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(event) =>
                  handleInputChange("estado", event.target.value.toUpperCase())
                }
                maxLength={2}
                className={errors.estado ? "border-destructive" : ""}
              />
              {errors.estado && <p className="text-sm text-destructive">{errors.estado}</p>}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="w-full sm:w-auto">
              {editingSupplier ? "Salvar alteracoes" : "Criar fornecedor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
