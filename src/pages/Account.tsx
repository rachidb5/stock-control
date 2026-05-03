import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { masks, validators } from "@/hooks/use-masks";
import { Layout } from "@/components/Layout";
import authService from "@/services/authService";
import userService from "@/services/userService";
import {
  hasFullAccess,
  roleDescriptions,
  roleLabels,
  selectCurrentUser,
  useSessionStore,
  UserRole,
} from "@/stores/useSessionStore";
import { LogOut, Mail, Phone, Save, ShieldCheck, User, UserPlus } from "lucide-react";

interface ValidationErrors {
  email?: string;
  phone?: string;
}

interface EditableUserData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export default function Account() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = useSessionStore(selectCurrentUser);
  const users = useSessionStore((state) => state.users);
  const updateCurrentUser = useSessionStore((state) => state.updateCurrentUser);
  const resetSession = useSessionStore((state) => state.resetSession);
  const setUsers = useSessionStore((state) => state.setUsers);

  const [userData, setUserData] = useState<EditableUserData>({
    name: currentUser.name,
    email: currentUser.email,
    phone: masks.phone(currentUser.phone),
    role: currentUser.role,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    setUserData({
      name: currentUser.name,
      email: currentUser.email,
      phone: masks.phone(currentUser.phone),
      role: currentUser.role,
    });
    setIsEditing(false);
    setErrors({});
  }, [currentUser]);

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
      nextErrors.email = "Email invalido";
    }

    if (!validators.phone(userData.phone)) {
      nextErrors.phone = "Telefone invalido (deve ter 11 digitos)";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Erro de validacao",
        description: "Revise os campos destacados antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedUser = await userService.updateUser(currentUser.id, {
        username: userData.name,
        email: userData.email,
        phone: userData.phone.replace(/\D/g, ""),
        role: userData.role,
      });

      updateCurrentUser({
        name: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      });

      if (hasFullAccess(currentUser)) {
        setUsers(await userService.getUsers());
      }

      setIsEditing(false);
      toast({
        title: "Conta atualizada",
        description: "Suas informacoes foram salvas pela API.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar usuario",
        description:
          error instanceof Error
            ? error.message
            : "Nao foi possivel salvar as alteracoes.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    resetSession();
    toast({
      title: "Logout realizado",
      description: "Voce foi desconectado com sucesso.",
    });
    navigate("/auth");
  };

  const getInitials = (name: string) =>
    (name || currentUser.email)
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
            Dados carregados e salvos pela API.
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
                  <Badge variant="secondary">{roleLabels[currentUser.role]}</Badge>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {roleDescriptions[currentUser.role]}
                </p>
              </div>

              {hasFullAccess(currentUser) && (
                <Button className="w-full" onClick={() => navigate("/conta/criar")}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar novo usuario
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
                  <CardTitle>Informacoes pessoais</CardTitle>
                  <CardDescription>
                    Edite apenas os campos persistidos pela API de usuarios.
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                    Editar perfil
                  </Button>
                ) : (
                  <Button onClick={handleSave} className="w-full sm:w-auto">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar alteracoes
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

                {hasFullAccess(currentUser) && (
                  <div className="space-y-2">
                    <Label htmlFor="role" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      Perfil de acesso
                    </Label>
                    <Select
                      value={userData.role}
                      onValueChange={(value) =>
                        handleInputChange("role", value as UserRole)
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vendedor">Vendedor</SelectItem>
                        <SelectItem value="gestor">Gestor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {hasFullAccess(currentUser) && (
              <Card>
                <CardHeader>
                  <CardTitle>Usuarios cadastrados</CardTitle>
                  <CardDescription>
                    Lista carregada diretamente de /users.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {users.map((user) => (
                    <div key={user.id} className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="break-all text-sm text-muted-foreground">{user.email}</p>
                          {user.phone && (
                            <p className="text-sm text-muted-foreground">
                              {masks.phone(user.phone)}
                            </p>
                          )}
                        </div>
                        <Badge variant={user.role !== "vendedor" ? "secondary" : "outline"}>
                          {roleLabels[user.role]}
                        </Badge>
                      </div>
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
