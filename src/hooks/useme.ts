import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import authService, { type AuthUser } from "@/services/authService";
import userService, { type ManagedUser } from "@/services/userService";
import {
  hasFullAccess,
  selectCurrentUser,
  selectIsAuthenticated,
  useSessionStore,
} from "@/stores/useSessionStore";

interface MeQueryData {
  currentUser: AuthUser;
  managedUsers: ManagedUser[];
}

async function loadAuthenticatedSession(): Promise<MeQueryData> {
  const currentUser = await authService.me();
  const managedUsers = hasFullAccess(currentUser)
    ? await userService.getUsers()
    : [];

  return { currentUser, managedUsers };
}

export function useMe() {
  const currentUser = useSessionStore(selectCurrentUser);
  const isAuthenticated = useSessionStore(selectIsAuthenticated);
  const setAuthenticatedUser = useSessionStore(
    (state) => state.setAuthenticatedUser,
  );
  const setUsers = useSessionStore((state) => state.setUsers);
  const resetSession = useSessionStore((state) => state.resetSession);

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: loadAuthenticatedSession,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!meQuery.data) {
      return;
    }

    const { currentUser: authenticatedUser, managedUsers } = meQuery.data;

    setAuthenticatedUser(authenticatedUser);

    if (managedUsers.length > 0) {
      setUsers(managedUsers);
      setAuthenticatedUser(authenticatedUser);
    }
  }, [meQuery.data, setAuthenticatedUser, setUsers]);

  useEffect(() => {
    if (meQuery.isError) {
      resetSession();
    }
  }, [meQuery.isError, resetSession]);

  return {
    ...meQuery,
    currentUser,
    isAuthenticated,
    isCheckingAuth: meQuery.isPending,
    isReady: !meQuery.isPending,
  };
}

export const useme = useMe;
