import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type UserRole = "vendedor" | "gestor" | "admin";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export type AuthenticatedUserInput = {
  id: string;
  username?: string;
  name?: string;
  email: string;
  phone?: string;
  role?: UserRole;
};

interface SessionState {
  users: AppUser[];
  currentUserId: string | null;
  setCurrentUser: (userId: string) => void;
  updateCurrentUser: (data: Partial<Omit<AppUser, "id">>) => void;
  setUsers: (users: AuthenticatedUserInput[]) => void;
  setAuthenticatedUser: (data: AuthenticatedUserInput) => string;
  resetSession: () => void;
}

type PersistedSessionState = Partial<Pick<SessionState, "currentUserId">>;

export const roleLabels: Record<UserRole, string> = {
  vendedor: "Vendedor",
  gestor: "Gestor",
  admin: "Admin",
};

export const roleDescriptions: Record<UserRole, string> = {
  vendedor: "Foco em acompanhar a propria carteira, meta e vendas do mes.",
  gestor: "Acesso gerencial para acompanhar equipe, comparativos e indicadores.",
  admin: "Acesso administrativo para gerenciar usuarios e configuracoes.",
};

export const isUserAdmin = (user: Pick<AppUser, "role">) => user.role === "admin";

export const hasFullAccess = (user: Pick<AppUser, "role"> | null | undefined) =>
  user?.role === "gestor" || user?.role === "admin";

export const hasCommercialManagementAccess = hasFullAccess;

const unauthenticatedUser: AppUser = {
  id: "",
  name: "",
  email: "",
  phone: "",
  role: "vendedor",
};

function normalizeRole(role?: string): UserRole {
  if (role === "gestor" || role === "admin") {
    return role;
  }

  return "vendedor";
}

export function mapApiUserToAppUser(user: AuthenticatedUserInput): AppUser {
  return {
    id: user.id,
    name: user.name ?? user.username ?? user.email,
    email: user.email,
    phone: user.phone ?? "",
    role: normalizeRole(user.role),
  };
}

function getDefaultState() {
  return {
    users: [],
    currentUserId: null,
  };
}

function buildSessionState(
  persistedState: PersistedSessionState | undefined,
): Pick<SessionState, "users" | "currentUserId"> {
  return {
    users: [],
    currentUserId: persistedState?.currentUserId ?? null,
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
      setUsers: (apiUsers) =>
        set((state) => {
          const users = apiUsers.map(mapApiUserToAppUser);
          const currentUserId = users.some((user) => user.id === state.currentUserId)
            ? state.currentUserId
            : users[0]?.id ?? null;

          return { users, currentUserId };
        }),
      setAuthenticatedUser: (data) => {
        const nextUser = mapApiUserToAppUser(data);

        set((state) => {
          const existingIndex = state.users.findIndex(
            (user) =>
              user.id === nextUser.id ||
              user.email.toLowerCase() === nextUser.email.toLowerCase(),
          );
          const users =
            existingIndex >= 0
              ? state.users.map((user, index) =>
                  index === existingIndex ? nextUser : user,
                )
              : [nextUser, ...state.users];

          return {
            users,
            currentUserId: nextUser.id,
          };
        });

        return nextUser.id;
      },
      resetSession: () => set(getDefaultState()),
    }),
    {
      name: "stock-control-session",
      version: 5,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
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

export const selectIsAuthenticated = (state: SessionState) =>
  Boolean(
    state.currentUserId &&
      state.users.some((user) => user.id === state.currentUserId),
  );

export const selectCurrentUser = (state: SessionState) =>
  state.users.find((user) => user.id === state.currentUserId) ??
  unauthenticatedUser;
