import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import CommercialDashboard from "./pages/CommercialDashboard";
import NotFound from "./pages/NotFound";
import AddEditStock from "./pages/AddEditStock";
import AddEditSale from "./pages/AddEditSale";
import StockDetail from "./pages/StockDetail";
import SaleDetail from "./pages/SaleDetail";
import Auth from "./pages/Auth";
import Clients from "./pages/Clients";
import Account from "./pages/Account";
import SellFromStock from "./pages/SellFromStock";
import CreateUser from "./pages/CreateUser";
import StockPage from "./pages/StockPage";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import authService from "@/services/authService";
import userService from "@/services/userService";
import { useSessionStore } from "@/stores/useSessionStore";
import { Loader2 } from "lucide-react";
const queryClient = new QueryClient();

function SessionBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const setAuthenticatedUser = useSessionStore(
    (state) => state.setAuthenticatedUser,
  );
  const setUsers = useSessionStore((state) => state.setUsers);
  const resetSession = useSessionStore((state) => state.resetSession);

  useEffect(() => {
    let active = true;

    const hydrateSession = async () => {
      try {
        const currentUser = await authService.me();
        if (!active) return;

        setAuthenticatedUser(currentUser);

        if (currentUser.role === "admin" || currentUser.role === "gestor") {
          const users = await userService.getUsers();
          if (!active) return;
          setUsers(users);
          setAuthenticatedUser(currentUser);
        }
      } catch {
        if (active) {
          resetSession();
        }
      } finally {
        if (active) {
          setReady(true);
        }
      }
    };

    hydrateSession();

    return () => {
      active = false;
    };
  }, [resetSession, setAuthenticatedUser, setUsers]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
        Carregando sessao...
      </div>
    );
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <SessionBootstrap>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/painel-comercial" element={<ProtectedRoute fullAccessOnly><CommercialDashboard /></ProtectedRoute>} />
          <Route path="/produtos" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/fornecedores" element={<ProtectedRoute fullAccessOnly><Suppliers /></ProtectedRoute>} />
          <Route path="/produto" element={<ProtectedRoute fullAccessOnly><StockPage /></ProtectedRoute>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/produto/add" element={<ProtectedRoute fullAccessOnly><AddEditStock /></ProtectedRoute>} />
          <Route path="/produto/edit/:id" element={<ProtectedRoute fullAccessOnly><AddEditStock /></ProtectedRoute>} />
          <Route path="/produto/:id" element={<ProtectedRoute fullAccessOnly><StockDetail /></ProtectedRoute>} />
          <Route path="/sale/add" element={<ProtectedRoute><AddEditSale /></ProtectedRoute>} />
          <Route path="/sale/edit/:id" element={<ProtectedRoute><AddEditSale /></ProtectedRoute>} />
          <Route path="/sale/:id" element={<ProtectedRoute><SaleDetail /></ProtectedRoute>} />
          <Route path="/sell/:id" element={<ProtectedRoute fullAccessOnly><SellFromStock /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute fullAccessOnly><Clients /></ProtectedRoute>} />
          <Route path="/conta" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/conta/criar" element={<ProtectedRoute fullAccessOnly><CreateUser /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </SessionBootstrap>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
