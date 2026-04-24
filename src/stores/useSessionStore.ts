import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type UserRole = "seller" | "admin";

export interface AppUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  company: string;
  role: UserRole;
  monthlyGoal: number;
}

export type CreateUserInput = Omit<AppUser, "id">;

interface SessionState {
  users: AppUser[];
  currentUserId: string;
  setCurrentUser: (userId: string) => void;
  updateCurrentUser: (data: Partial<Omit<AppUser, "id">>) => void;
  addUser: (data: CreateUserInput) => string;
  resetSession: () => void;
}

type PersistedSessionState = Partial<Pick<SessionState, "users" | "currentUserId">>;

export const roleLabels: Record<UserRole, string> = {
  seller: "Vendedor",
  admin: "Administrador",
};

export const roleDescriptions: Record<UserRole, string> = {
  seller: "Foco em acompanhar a própria carteira, meta e vendas do mês.",
  admin: "Acesso gerencial para acompanhar equipe, comparativos e indicadores.",
};

export const defaultUsers: AppUser[] = [
  {
    id: "seller-joao",
    employeeId: "VEN-1001",
    name: "João Silva",
    email: "joao.silva@exemplo.com",
    phone: "(11) 99999-9999",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    company: "StockControl Mobile",
    role: "seller",
    monthlyGoal: 48000,
  },
  {
    id: "seller-camila",
    employeeId: "VEN-1002",
    name: "Camila Rocha",
    email: "camila.rocha@exemplo.com",
    phone: "(11) 98888-1100",
    address: "Av. Brasil, 456",
    city: "São Paulo",
    company: "StockControl Mobile",
    role: "seller",
    monthlyGoal: 56000,
  },
  {
    id: "seller-rafael",
    employeeId: "VEN-1003",
    name: "Rafael Costa",
    email: "rafael.costa@exemplo.com",
    phone: "(11) 97777-2200",
    address: "Rua Central, 50",
    city: "Campinas",
    company: "StockControl Mobile",
    role: "seller",
    monthlyGoal: 52000,
  },
  {
    id: "admin-mariana",
    employeeId: "ADM-2001",
    name: "Mariana Alves",
    email: "mariana.alves@exemplo.com",
    phone: "(11) 96666-3300",
    address: "Alameda Santos, 700",
    city: "São Paulo",
    company: "StockControl Mobile",
    role: "admin",
    monthlyGoal: 156000,
  },
];

const defaultUsersById = new Map(defaultUsers.map((user) => [user.id, user]));

function normalizeUser(user: Partial<AppUser>, index: number): AppUser {
  const fallback = user.id ? defaultUsersById.get(user.id) : undefined;
  const generatedEmployeeId =
    user.role === "admin"
      ? `ADM-${String(index + 1).padStart(4, "0")}`
      : `VEN-${String(index + 1).padStart(4, "0")}`;

  return {
    id: user.id ?? fallback?.id ?? `user-${crypto.randomUUID()}`,
    employeeId: user.employeeId ?? fallback?.employeeId ?? generatedEmployeeId,
    name: user.name ?? fallback?.name ?? "Usuário",
    email: user.email ?? fallback?.email ?? `usuario${index + 1}@exemplo.com`,
    phone: user.phone ?? fallback?.phone ?? "",
    address: user.address ?? fallback?.address ?? "",
    city: user.city ?? fallback?.city ?? "",
    company: user.company ?? fallback?.company ?? "StockControl Mobile",
    role: user.role ?? fallback?.role ?? "seller",
    monthlyGoal: user.monthlyGoal ?? fallback?.monthlyGoal ?? 45000,
  };
}

function getDefaultState() {
  return {
    users: defaultUsers,
    currentUserId: defaultUsers[0].id,
  };
}

function buildSessionState(
  persistedState: PersistedSessionState | undefined,
): Pick<SessionState, "users" | "currentUserId"> {
  if (!persistedState?.users?.length) {
    return getDefaultState();
  }

  const users = persistedState.users.map((user, index) => normalizeUser(user, index));
  const currentUserId = users.some((user) => user.id === persistedState.currentUserId)
    ? persistedState.currentUserId ?? users[0].id
    : users[0].id;

  return {
    users,
    currentUserId,
  };
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...getDefaultState(),
      setCurrentUser: (userId) =>
        set((state) => ({
          currentUserId: state.users.some((user) => user.id === userId)
            ? userId
            : state.currentUserId,
        })),
      updateCurrentUser: (data) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === state.currentUserId ? { ...user, ...data } : user,
          ),
        })),
      addUser: (data) => {
        const newId = `user-${crypto.randomUUID()}`;

        set((state) => ({
          users: [...state.users, { id: newId, ...data }],
        }));

        return newId;
      },
      resetSession: () => set(getDefaultState()),
    }),
    {
      name: "stock-control-session",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        users: state.users,
        currentUserId: state.currentUserId,
      }),
      migrate: (persistedState) =>
        buildSessionState(persistedState as PersistedSessionState | undefined),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...buildSessionState(persistedState as PersistedSessionState | undefined),
      }),
    },
  ),
);

export const selectCurrentUser = (state: SessionState) =>
  state.users.find((user) => user.id === state.currentUserId) ?? state.users[0] ?? defaultUsers[0];
