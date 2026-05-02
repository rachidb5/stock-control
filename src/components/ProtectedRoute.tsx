import { Navigate } from "react-router-dom";
import {
  hasFullAccess,
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
  const currentUser = useSessionStore(selectCurrentUser);

  if (fullAccessOnly && !hasFullAccess(currentUser)) {
    return <Navigate to="/produtos?tab=vendas" replace />;
  }

  return <>{children}</>;
}
