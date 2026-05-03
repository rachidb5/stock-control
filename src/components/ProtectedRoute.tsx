import { Navigate } from "react-router-dom";
import {
  hasFullAccess,
  selectIsAuthenticated,
  selectCurrentUser,
  useSessionStore,
} from "@/stores/useSessionStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fullAccessOnly?: boolean;
}

export function ProtectedRoute({
  children,
  fullAccessOnly = false,
}: ProtectedRouteProps) {
  const isAuthenticated = useSessionStore(selectIsAuthenticated);
  const currentUser = useSessionStore(selectCurrentUser);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (fullAccessOnly && !hasFullAccess(currentUser)) {
    return <Navigate to="/produtos?tab=vendas" replace />;
  }

  return <>{children}</>;
}
