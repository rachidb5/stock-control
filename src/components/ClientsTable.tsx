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
import { Badge } from "@/components/ui/badge";
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
import clientService, {
  Client,
  ClientInput,
  ClientResponse,
} from "@/services/clientService";
import {
  Edit,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

interface ClientFormData extends Omit<ClientInput, "total_compras"> {
  total_compras: string;
}

interface ClientFormErrors {
  nome?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

const emptyClientForm: ClientFormData = {
  nome: "",
  cpf: "",
  email: "",
  telefone: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  data_cadastro: new Date().toISOString().split("T")[0],
  total_compras: "0",
};

export function ClientsTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draftSearchTerm, setDraftSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>(emptyClientForm);
  const [errors, setErrors] = useState<ClientFormErrors>({});

  const clientsQuery = useQuery({
    queryKey: ["clients", pagination.page, pagination.limit, searchTerm],
    queryFn: () =>
      clientService.getClients({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const response = clientsQuery.data as ClientResponse | undefined;
  const clients = response?.data ?? [];
  const total = response?.total ?? 0;
  const loading = clientsQuery.isLoading;

  useEffect(() => {
    if (clientsQuery.isError) {
      toast({
        title: "Erro ao carregar clientes",
        description:
          clientsQuery.error instanceof Error
            ? clientsQuery.error.message
            : "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  }, [clientsQuery.error, clientsQuery.isError, toast]);

  const totalPurchases = clients.reduce((sum, client) => sum + client.total_compras, 0);

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    const maskMap: Partial<Record<keyof ClientFormData, (current: string) => string>> = {
      cpf: masks.cpf,
      telefone: masks.phone,
      cep: masks.cep,
    };

    const nextValue = maskMap[field] ? maskMap[field]?.(value) ?? value : value;

    setFormData((prev) => ({ ...prev, [field]: nextValue }));

    if (errors[field as keyof ClientFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const openCreateDialog = () => {
    setEditingClient(null);
    setFormData({
      ...emptyClientForm,
      data_cadastro: new Date().toISOString().split("T")[0],
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setFormData({
      ...client,
      cpf: masks.cpf(client.cpf),
      telefone: masks.phone(client.telefone),
      cep: masks.cep(client.cep),
      total_compras: String(client.total_compras),
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const applySearch = () => {
    setSearchTerm(draftSearchTerm);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const validateForm = () => {
    const nextErrors: ClientFormErrors = {};

    if (!formData.nome.trim()) {
      nextErrors.nome = "Nome é obrigatório";
    }

    if (!validators.cpf(formData.cpf)) {
      nextErrors.cpf = "CPF inválido";
    }

    if (!validators.email(formData.email)) {
      nextErrors.email = "Email inválido";
    }

    if (!validators.phone(formData.telefone)) {
      nextErrors.telefone = "Telefone inválido";
    }

    if (!formData.cidade.trim()) {
      nextErrors.cidade = "Cidade é obrigatória";
    }

    if (formData.estado.trim().length !== 2) {
      nextErrors.estado = "Informe a UF com 2 letras";
    }

    if (!validators.cep(formData.cep)) {
      nextErrors.cep = "CEP inválido";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Revise o formulário",
        description: "Corrija os campos destacados antes de salvar o cliente.",
        variant: "destructive",
      });
      return;
    }

    const payload: ClientInput = {
      nome: formData.nome,
      cpf: formData.cpf.replace(/\D/g, ""),
      email: formData.email,
      telefone: formData.telefone.replace(/\D/g, ""),
      endereco: formData.endereco,
      cidade: formData.cidade,
      estado: formData.estado.toUpperCase(),
      cep: formData.cep.replace(/\D/g, ""),
      data_cadastro: formData.data_cadastro,
      total_compras: Number(formData.total_compras || 0),
    };

    try {
      if (editingClient) {
        await clientService.updateClient(editingClient.id, payload);
        toast({
          title: "Cliente atualizado",
          description: `${payload.nome} foi atualizado com sucesso.`,
        });
      } else {
        await clientService.createClient(payload);
        toast({
          title: "Cliente criado",
          description: `${payload.nome} foi adicionado à base.`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar cliente",
        description:
          error instanceof Error ? error.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (client: Client) => {
    if (!window.confirm(`Deseja remover ${client.nome} da base de clientes?`)) {
      return;
    }

    try {
      await clientService.deleteClient(client.id);
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Cliente removido",
        description: `${client.nome} foi excluído com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao remover cliente",
        description:
          error instanceof Error ? error.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  };

  const formatCPF = (cpf: string) =>
    cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

  const formatPhone = (phone: string) =>
    phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">Clientes</h2>
          <p className="text-muted-foreground">
            Organize sua carteira, atualize dados e mantenha o relacionamento sempre à mão.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de clientes</CardDescription>
            <CardTitle className="text-3xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Compras registradas</CardDescription>
            <CardTitle className="text-3xl">{totalPurchases}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Base filtrada</CardDescription>
            <CardTitle className="text-3xl">{clients.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Clientes Cadastrados
              </CardTitle>
              <CardDescription>
                Busque, edite e remova clientes diretamente desta página.
              </CardDescription>
            </div>
            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
              <div className="relative w-full md:w-[320px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email, telefone ou CPF..."
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
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Localidade</TableHead>
                  <TableHead>Compras</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      {loading
                        ? "Carregando clientes..."
                        : "Nenhum cliente encontrado com os filtros atuais."}
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="max-w-[220px] truncate font-medium">{client.nome}</TableCell>
                      <TableCell>{formatCPF(client.cpf)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {formatPhone(client.telefone)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="block max-w-[220px] truncate">{client.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {client.cidade}, {client.estado}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{client.total_compras}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(client)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(client)}>
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
                {Math.min(pagination.page * pagination.limit, total)} de {total} clientes
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
                  Página {pagination.page}
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
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Editar cliente" : "Novo cliente"}</DialogTitle>
            <DialogDescription>
              Preencha os dados principais para manter a carteira de clientes atualizada.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(event) => handleInputChange("nome", event.target.value)}
                className={errors.nome ? "border-destructive" : ""}
              />
              {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(event) => handleInputChange("cpf", event.target.value)}
                maxLength={14}
                className={errors.cpf ? "border-destructive" : ""}
              />
              {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
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
                onChange={(event) => handleInputChange("estado", event.target.value.toUpperCase())}
                maxLength={2}
                className={errors.estado ? "border-destructive" : ""}
              />
              {errors.estado && <p className="text-sm text-destructive">{errors.estado}</p>}
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

            <div className="space-y-2">
              <Label htmlFor="total_compras">Compras registradas</Label>
              <Input
                id="total_compras"
                type="number"
                min="0"
                value={formData.total_compras}
                onChange={(event) => handleInputChange("total_compras", event.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="w-full sm:w-auto">
              {editingClient ? "Salvar alterações" : "Criar cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
