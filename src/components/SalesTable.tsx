import { useCallback, useEffect, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  Edit,
  FileDown,
  Upload,
  FileSpreadsheet,
  UserRound,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { exportRowsToWorkbook, importRowsFromWorkbook } from "@/lib/excel";
import sellService, {
  SoldDevice,
  SoldDeviceResponse,
} from "@/services/sellService";

type SalesTableDevice = SoldDevice;

interface SalesTableProps {
  devices?: SalesTableDevice[];
  showSeller?: boolean;
  useApi?: boolean;
  search?: string;
  status?: string;
  condition?: string;
  startDate?: string;
  endDate?: string;
  hideFilters?: boolean;
  page?: number;
  onPageChange?: (page: number) => void;
}

export function SalesTable({
  devices: providedDevices,
  showSeller = false,
  useApi = false,
  search,
  status,
  condition,
  startDate: controlledStartDate,
  endDate: controlledEndDate,
  hideFilters = false,
  page,
  onPageChange,
}: SalesTableProps) {
  const [draftSearchTerm, setDraftSearchTerm] = useState("");
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [draftStatusFilter, setDraftStatusFilter] = useState<string>("all");
  const [localStatusFilter, setLocalStatusFilter] = useState<string>("all");
  const [draftConditionFilter, setDraftConditionFilter] = useState<string>("all");
  const [localConditionFilter, setLocalConditionFilter] = useState<string>("all");
  const [draftSellerFilter, setDraftSellerFilter] = useState<string>("all");
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [localStartDate, setLocalStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchTerm = search ?? localSearchTerm;
  const statusFilter = status ?? localStatusFilter;
  const conditionFilter = condition ?? localConditionFilter;
  const startDate = controlledStartDate ?? localStartDate;
  const endDate = controlledEndDate ?? localEndDate;
  const currentPage = page ?? pagination.page;

  const salesQuery = useQuery({
    queryKey: [
      "sold-devices",
      currentPage,
      pagination.limit,
      searchTerm,
      statusFilter,
      conditionFilter,
      startDate,
      endDate,
    ],
    queryFn: () =>
      sellService.getSales({
        page: currentPage,
        limit: pagination.limit,
        search: searchTerm || undefined,
        status:
          statusFilter === "all"
            ? undefined
            : (statusFilter as "completed" | "pending"),
        condition: conditionFilter === "all" ? undefined : conditionFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    enabled: useApi,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const apiResponse = salesQuery.data as SoldDeviceResponse | undefined;
  const devices = useApi ? apiResponse?.data ?? [] : providedDevices ?? [];
  const total = useApi ? apiResponse?.total ?? 0 : devices.length;
  const loading = useApi ? salesQuery.isLoading : false;
  const { refetch: refetchSales } = salesQuery;

  const fetchSales = useCallback(() => {
    refetchSales();
  }, [refetchSales]);

  useEffect(() => {
    if (salesQuery.isError) {
      console.error("Erro ao carregar vendas:", salesQuery.error);
      toast.error("Erro ao carregar vendas. Tente novamente.");
    }
  }, [salesQuery.error, salesQuery.isError]);

  const sellers = Array.from(
    new Set(
      devices
        .map((device) => device.vendedor_nome)
        .filter((seller): seller is string => Boolean(seller)),
    ),
  );

  const filteredDevices = devices.filter((device) => {
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch =
      device.aparelho.toLowerCase().includes(normalizedSearch) ||
      device.comprador.toLowerCase().includes(normalizedSearch) ||
      device.imei.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && device.aparelho_recebido) ||
      (statusFilter === "pending" && !device.aparelho_recebido);

    const matchesCondition =
      conditionFilter === "all" || device.condicao === conditionFilter;

    const matchesSeller =
      !showSeller ||
      sellerFilter === "all" ||
      (device.vendedor_nome ?? "") === sellerFilter;

    const deviceDate = new Date(`${device.data.split("T")[0]}T00:00:00`);
    const matchesStartDate =
      !startDate || deviceDate >= new Date(`${startDate}T00:00:00`);
    const matchesEndDate =
      !endDate || deviceDate <= new Date(`${endDate}T23:59:59`);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCondition &&
      matchesSeller &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatCurrency = (value: unknown) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(toNumber(value));

  const getConditionBadge = (condition: string) => {
    const variants: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        className: string;
      }
    > = {
      Novo: {
        variant: "default",
        className: "bg-success text-success-foreground",
      },
      Seminovo: {
        variant: "secondary",
        className: "bg-primary/10 text-primary",
      },
      Usado: {
        variant: "outline",
        className: "bg-warning/10 text-warning border-warning",
      },
      Recondicionado: {
        variant: "outline",
        className: "bg-accent/10 text-accent border-accent",
      },
    };

    const config = variants[condition] || variants.Usado;
    return (
      <Badge variant={config.variant} className={config.className}>
        {condition}
      </Badge>
    );
  };

  const calculateProfit = (device: SalesTableDevice) => {
    if (!device.aparelho_recebido) {
      return 0;
    }

    return toNumber(device.valor_total_venda) - toNumber(device.valor_compra);
  };

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
      return;
    }

    setPagination((prev) => ({ ...prev, page }));
  };

  const applyFilters = () => {
    setLocalSearchTerm(draftSearchTerm);
    setLocalStatusFilter(draftStatusFilter);
    setLocalConditionFilter(draftConditionFilter);
    setSellerFilter(draftSellerFilter);
    setLocalStartDate(draftStartDate);
    setLocalEndDate(draftEndDate);
    handlePageChange(1);
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Tem certeza que deseja remover esta venda?")) {
      return;
    }

    try {
      await sellService.deleteSale(id);
      toast.success("Venda removida com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["sold-devices"] });
    } catch (error) {
      console.error("Erro ao remover venda:", error);
      toast.error("Erro ao remover venda.");
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Relatório de Vendas", 14, 15);

    const tableData = filteredDevices.map((device) => [
      device.data,
      device.aparelho,
      device.condicao,
      showSeller ? (device.vendedor_nome ?? "-") : "-",
      formatCurrency(device.valor_total_venda),
      formatCurrency(device.valor_compra),
      formatCurrency(calculateProfit(device)),
      device.aparelho_recebido ? "Concluído" : "Pendente",
    ]);

    autoTable(doc, {
      head: [
        [
          "Data",
          "Aparelho",
          "Condição",
          "Vendedor",
          "Valor Venda",
          "Valor Custo",
          "Lucro",
          "Status",
        ],
      ],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`vendas-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportToExcel = () => {
    const worksheetData = filteredDevices.map((device) => ({
      Data: device.data,
      Aparelho: device.aparelho,
      Cor: device.cor,
      IMEI: device.imei,
      Condição: device.condicao,
      Comprador: device.comprador,
      Telefone: device.numero_telefone,
      Vendedor: device.vendedor_nome ?? "-",
      Canal: device.canal_venda ?? "-",
      "Valor de Venda": device.valor_total_venda,
      "Valor de Compra": device.valor_compra,
      Lucro: calculateProfit(device),
      Status: device.aparelho_recebido ? "Concluído" : "Pendente",
      Observação: device.observacao,
    }));
    void exportRowsToWorkbook(
      worksheetData,
      `vendas-${new Date().toISOString().split("T")[0]}.xlsx`,
      "Vendas",
    );
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Use um arquivo .xlsx para importar vendas.");
      event.target.value = "";
      return;
    }

    try {
      const rows = await importRowsFromWorkbook(file);
      console.log("Dados importados:", rows);
      toast.success(`${rows.length} linha(s) lidas da planilha de vendas.`);
    } catch (error) {
      console.error("Erro ao importar planilha de vendas:", error);
      toast.error("Erro ao importar arquivo de vendas.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <Card className="min-w-0 shadow-md">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <CardTitle>
              {showSeller ? "Vendas da operação" : "Minhas vendas"}
            </CardTitle>
            <CardDescription>
              {showSeller
                ? "Acompanhe toda a equipe comercial com filtros rápidos."
                : "Acompanhe seu histórico, filtre negociações e exporte relatórios."}
            </CardDescription>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
            {useApi && (
              <Button
                onClick={fetchSales}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Atualizar
              </Button>
            )}
            <Button onClick={exportToPDF} variant="outline" size="sm" disabled={loading}>
              <FileDown className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button onClick={exportToExcel} variant="outline" size="sm" disabled={loading}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" size="sm" asChild disabled={loading}>
              <label className="flex cursor-pointer items-center">
                <Upload className="mr-2 h-4 w-4" />
                Importar
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleImportExcel}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </div>
        {!hideFilters && <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por aparelho, comprador ou IMEI..."
              value={draftSearchTerm}
              onChange={(event) => setDraftSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyFilters();
                }
              }}
              className="pl-8"
              disabled={loading}
            />
          </div>
          <div className={`grid gap-3 ${showSeller ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
            <Input
              type="date"
              placeholder="Data inicial"
              value={draftStartDate}
              onChange={(event) => setDraftStartDate(event.target.value)}
            />
            <Input
              type="date"
              placeholder="Data final"
              value={draftEndDate}
              onChange={(event) => setDraftEndDate(event.target.value)}
            />
            <Select
              value={draftStatusFilter}
              onValueChange={setDraftStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={draftConditionFilter}
              onValueChange={setDraftConditionFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Condição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as condições</SelectItem>
                <SelectItem value="Novo">Novo</SelectItem>
                <SelectItem value="Seminovo">Seminovo</SelectItem>
                <SelectItem value="Usado">Usado</SelectItem>
                <SelectItem value="Recondicionado">Recondicionado</SelectItem>
              </SelectContent>
            </Select>
            {showSeller && (
              <Select value={draftSellerFilter} onValueChange={setDraftSellerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Vendedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toda a equipe</SelectItem>
                  {sellers.map((seller) => (
                    <SelectItem key={seller} value={seller}>
                      {seller}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={applyFilters} disabled={loading} className="w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Carregando vendas...</span>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Aparelho</TableHead>
                    {showSeller && <TableHead>Vendedor</TableHead>}
                    <TableHead>Condição</TableHead>
                    <TableHead>Comprador</TableHead>
                    <TableHead>Valor venda</TableHead>
                    <TableHead>Lucro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={showSeller ? 9 : 8}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Nenhuma venda encontrada com os filtros atuais.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDevices.map((device) => {
                      const profit = calculateProfit(device);

                      return (
                        <TableRow key={device.id}>
                          <TableCell className="font-medium">
                            {new Date(device.data).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="max-w-[220px] truncate font-medium">{device.aparelho}</div>
                              <div className="text-xs text-muted-foreground">
                                {device.cor}
                                {device.canal_venda
                                  ? ` • ${device.canal_venda}`
                                  : ""}
                              </div>
                            </div>
                          </TableCell>
                          {showSeller && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <UserRound className="h-4 w-4 text-muted-foreground" />
                                <span className="max-w-[160px] truncate">
                                  {device.vendedor_nome ?? "Sem vendedor"}
                                </span>
                              </div>
                            </TableCell>
                          )}
                          <TableCell>{getConditionBadge(device.condicao)}</TableCell>
                          <TableCell>
                            <div>
                              <div className="max-w-[180px] truncate font-medium">{device.comprador}</div>
                              <div className="text-xs text-muted-foreground">
                                {device.numero_telefone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(device.valor_total_venda)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                profit >= 0 ? "text-success" : "text-destructive"
                              }
                            >
                              {formatCurrency(profit)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                device.aparelho_recebido ? "default" : "secondary"
                              }
                            >
                              {device.aparelho_recebido
                                ? "Concluído"
                                : "Pendente"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/sale/${device.id}`)}
                                title="Ver detalhes"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/sale/edit/${device.id}`)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {useApi && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(device.id)}
                                  title="Excluir"
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {useApi && total > pagination.limit && (
              <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * pagination.limit + 1} a{" "}
                  {Math.min(currentPage * pagination.limit, total)}{" "}
                  de {total} vendas
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Página {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={
                      currentPage * pagination.limit >= total ||
                      loading
                    }
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
