import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Building,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Target,
  User,
  UserPlus,
} from "lucide-react";
import { masks, validators } from "@/hooks/use-masks";
import { Layout } from "@/components/Layout";
import {
  isUserAdmin,
  roleDescriptions,
  selectCurrentUser,
  useSessionStore,
  UserRole,
} from "@/stores/useSessionStore";
import userService from "@/services/userService";

interface ValidationErrors {
  name?: string;
  employeeId?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  monthlyGoal?: string;
}

export default function CreateUser() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = useSessionStore(selectCurrentUser);
  const users = useSessionStore((state) => state.users);
  const addUser = useSessionStore((state) => state.addUser);

  const [userData, setUserData] = useState({
    name: "",
    employeeId: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    company: currentUser.company,
    role: "vendedor" as UserRole,
    monthlyGoal: "45000",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof typeof userData, value: string) => {
    const maskMap: Partial<Record<keyof typeof userData, (current: string) => string>> = {
      phone: masks.phone,
    };
    const nextValue = field === "employeeId"
      ? value.toUpperCase().replace(/\s+/g, "-")
      : maskMap[field]
        ? maskMap[field]?.(value) ?? value
        : value;

    setUserData((prev) => ({ ...prev, [field]: nextValue }));

    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const nextErrors: ValidationErrors = {};

    if (!userData.name.trim()) {
      nextErrors.name = "Nome é obrigatório";
    }

    if (!userData.employeeId.trim()) {
      nextErrors.employeeId = "Matrícula é obrigatória";
    } else if (
      users.some(
        (user) => user.employeeId.toLowerCase() === userData.employeeId.toLowerCase(),
      )
    ) {
      nextErrors.employeeId = "Esta matrícula já está em uso";
    }

    if (!validators.email(userData.email)) {
      nextErrors.email = "Email inválido";
    } else if (users.some((user) => user.email.toLowerCase() === userData.email.toLowerCase())) {
      nextErrors.email = "Este email já está em uso";
    }

    if (!validators.phone(userData.phone)) {
      nextErrors.phone = "Telefone inválido (deve ter 11 dígitos)";
    }

    if (!userData.password || userData.password.length < 6) {
      nextErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (userData.password !== userData.confirmPassword) {
      nextErrors.confirmPassword = "As senhas não coincidem";
    }

    if (!userData.monthlyGoal || Number(userData.monthlyGoal) <= 0) {
      nextErrors.monthlyGoal = "Informe uma meta mensal válida";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Corrija os campos destacados para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const createdUser = await userService.createUser({
        username: userData.name,
        email: userData.email,
        phone: userData.phone.replace(/\D/g, ""),
        password: userData.password,
        role: userData.role,
      });

      addUser({
        id: createdUser.id,
        name: userData.name,
        employeeId: userData.employeeId,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        company: userData.company,
        role: userData.role,
        monthlyGoal: Number(userData.monthlyGoal),
      });

      toast({
        title: "Usuário criado",
        description: `${userData.name} (${userData.employeeId}) agora faz parte da equipe.`,
      });

      navigate("/conta");
    } catch (error) {
      toast({
        title: "Erro ao criar usuário",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao salvar o novo usuário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isUserAdmin(currentUser)) {
    return (
      <Layout>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Acesso restrito</CardTitle>
            <CardDescription>
              Apenas administradores podem cadastrar e configurar usuários.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/conta")} className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para minha conta
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <Button variant="ghost" size="icon" onClick={() => navigate("/conta")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Criar Usuário</h1>
            <p className="text-muted-foreground">
              Cadastre vendedores, gestores e administradores com matrícula e meta inicial.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Novo membro da equipe
            </CardTitle>
            <CardDescription>
              Preencha os dados de acesso e a identificação interna do usuário.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Nome completo *
              </Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(event) => handleInputChange("name", event.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Matrícula *
              </Label>
              <Input
                id="employeeId"
                value={userData.employeeId}
                onChange={(event) => handleInputChange("employeeId", event.target.value)}
                placeholder="VEN-1004"
                className={errors.employeeId ? "border-destructive" : ""}
              />
              {errors.employeeId && (
                <p className="text-sm text-destructive">{errors.employeeId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(event) => handleInputChange("email", event.target.value)}
                placeholder="email@empresa.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Telefone *
              </Label>
              <Input
                id="phone"
                value={userData.phone}
                onChange={(event) => handleInputChange("phone", event.target.value)}
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Endereço
              </Label>
              <Input
                id="address"
                value={userData.address}
                onChange={(event) => handleInputChange("address", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                Perfil de acesso *
              </Label>
              <Select value={userData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{roleDescriptions[userData.role]}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyGoal" className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                Meta mensal *
              </Label>
              <Input
                id="monthlyGoal"
                type="number"
                min="0"
                value={userData.monthlyGoal}
                onChange={(event) => handleInputChange("monthlyGoal", event.target.value)}
                className={errors.monthlyGoal ? "border-destructive" : ""}
              />
              {errors.monthlyGoal && (
                <p className="text-sm text-destructive">{errors.monthlyGoal}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={userData.password}
                onChange={(event) => handleInputChange("password", event.target.value)}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={userData.confirmPassword}
                onChange={(event) => handleInputChange("confirmPassword", event.target.value)}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => navigate("/conta")} disabled={isLoading} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Criando..." : "Criar usuário"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
