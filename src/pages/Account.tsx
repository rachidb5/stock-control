import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  formatDuration,
  formatTime,
  getEntryDurationMs,
  getTodayWorkedMs,
} from "@/lib/timeClock";
import { masks, validators } from "@/hooks/use-masks";
import { Layout } from "@/components/Layout";
import {
  roleDescriptions,
  roleLabels,
  selectCurrentUser,
  useSessionStore,
} from "@/stores/useSessionStore";
import { useTimeClockStore } from "@/stores/useTimeClockStore";
import {
  Building,
  Clock3,
  CreditCard,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Target,
  User,
  UserPlus,
} from "lucide-react";

interface ValidationErrors {
  email?: string;
  phone?: string;
}

interface EditableUserData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  company: string;
}

export default function Account() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = useSessionStore(selectCurrentUser);
  const users = useSessionStore((state) => state.users);
  const updateCurrentUser = useSessionStore((state) => state.updateCurrentUser);
  const entries = useTimeClockStore((state) => state.entries);

  const [userData, setUserData] = useState<EditableUserData>({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    address: currentUser.address,
    city: currentUser.city,
    company: currentUser.company,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    setUserData({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      address: currentUser.address,
      city: currentUser.city,
      company: currentUser.company,
    });
    setIsEditing(false);
    setErrors({});
  }, [currentUser]);

  const userEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.userId === currentUser.id)
        .slice()
        .sort((left, right) => new Date(right.clockIn).getTime() - new Date(left.clockIn).getTime())
        .slice(0, 5),
    [entries, currentUser.id],
  );
  const todayWorked = useMemo(
    () => getTodayWorkedMs(entries, currentUser.id),
    [entries, currentUser.id],
  );

  const handleInputChange = (field: keyof EditableUserData, value: string) => {
    const maskedValue = field === "phone" ? masks.phone(value) : value;

    setUserData((prev) => ({ ...prev, [field]: maskedValue }));

    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const nextErrors: ValidationErrors = {};

    if (!validators.email(userData.email)) {
      nextErrors.email = "Email inválido";
    }

    if (!validators.phone(userData.phone)) {
      nextErrors.phone = "Telefone inválido (deve ter 11 dígitos)";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Revise os campos destacados antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    updateCurrentUser({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      city: userData.city,
      company: userData.company,
    });

    setIsEditing(false);
    toast({
      title: "Conta atualizada",
      description: "Suas informações pessoais foram salvas com sucesso.",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    navigate("/auth");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Minha Conta</h1>
          <p className="text-muted-foreground">
            Acompanhe seus dados, sua matrícula e seu histórico de ponto.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px,1fr]">
          <Card className="h-fit">
            <CardHeader className="text-center">
              <Avatar className="mx-auto h-24 w-24">
                <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4 break-words">{currentUser.name}</CardTitle>
              <CardDescription className="break-all">{currentUser.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Perfil</p>
                    <p className="mt-1 font-medium">{roleLabels[currentUser.role]}</p>
                  </div>
                  <Badge variant="secondary">{currentUser.employeeId}</Badge>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {roleDescriptions[currentUser.role]}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground">Meta mensal</p>
                <p className="mt-1 text-2xl font-semibold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(currentUser.monthlyGoal)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {currentUser.role === "vendedor"
                    ? "Meta individual visível apenas para você e para a gestão."
                    : "Meta consolidada usada na visão gerencial."}
                </p>
              </div>

              {currentUser.role === "gestor" && (
                <Button className="w-full" onClick={() => navigate("/conta/criar")}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar novo usuário
                </Button>
              )}

              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair da conta
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Informações pessoais</CardTitle>
                  <CardDescription>
                    Atualize apenas seus dados de contato e localização.
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">Editar perfil</Button>
                ) : (
                  <Button onClick={handleSave} className="w-full sm:w-auto">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar alterações
                  </Button>
                )}
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Nome completo
                  </Label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(event) => handleInputChange("name", event.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Matrícula
                  </Label>
                  <Input id="employeeId" value={currentUser.employeeId} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(event) => handleInputChange("email", event.target.value)}
                    disabled={!isEditing}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    value={userData.phone}
                    onChange={(event) => handleInputChange("phone", event.target.value)}
                    disabled={!isEditing}
                    maxLength={15}
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    Empresa
                  </Label>
                  <Input
                    id="company"
                    value={userData.company}
                    onChange={(event) => handleInputChange("company", event.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyGoal" className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    Meta mensal
                  </Label>
                  <Input
                    id="monthlyGoal"
                    value={new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(currentUser.monthlyGoal)}
                    disabled
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Endereço
                  </Label>
                  <Input
                    id="address"
                    value={userData.address}
                    onChange={(event) => handleInputChange("address", event.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Cidade
                  </Label>
                  <Input
                    id="city"
                    value={userData.city}
                    onChange={(event) => handleInputChange("city", event.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-primary" />
                  Registro de ponto
                </CardTitle>
                <CardDescription>
                  Acompanhe suas últimas batidas e o total trabalhado hoje.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
                    <p className="text-sm text-muted-foreground">Horas trabalhadas hoje</p>
                    <p className="mt-1 text-2xl font-semibold">{formatDuration(todayWorked)}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
                    <p className="text-sm text-muted-foreground">Últimos registros</p>
                    <p className="mt-1 text-2xl font-semibold">{userEntries.length}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {userEntries.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                      Ainda não há registros de ponto para este usuário.
                    </div>
                  ) : (
                    userEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-secondary/20 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-medium">
                            Entrada às {formatTime(entry.clockIn)}
                            {entry.clockOut ? ` • Saída às ${formatTime(entry.clockOut)}` : " • Em andamento"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Intl.DateTimeFormat("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }).format(new Date(entry.clockIn))}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {formatDuration(getEntryDurationMs(entry))}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {currentUser.role === "gestor" && (
              <Card>
                <CardHeader>
                  <CardTitle>Equipe cadastrada</CardTitle>
                  <CardDescription>
                    Visão gerencial com matrícula, perfil e meta individual.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {users.map((user) => (
                    <div key={user.id} className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.employeeId}</p>
                        </div>
                        <Badge variant={user.role === "gestor" ? "secondary" : "outline"}>
                          {roleLabels[user.role]}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Meta:{" "}
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(user.monthlyGoal)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
