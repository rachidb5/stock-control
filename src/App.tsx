import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/painel-comercial" element={<ProtectedRoute fullAccessOnly><CommercialDashboard /></ProtectedRoute>} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/fornecedores" element={<ProtectedRoute fullAccessOnly><Suppliers /></ProtectedRoute>} />
          <Route path="/produto" element={<ProtectedRoute fullAccessOnly><StockPage /></ProtectedRoute>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/produto/add" element={<ProtectedRoute fullAccessOnly><AddEditStock /></ProtectedRoute>} />
          <Route path="/produto/edit/:id" element={<ProtectedRoute fullAccessOnly><AddEditStock /></ProtectedRoute>} />
          <Route path="/produto/:id" element={<ProtectedRoute fullAccessOnly><StockDetail /></ProtectedRoute>} />
          <Route path="/sale/add" element={<AddEditSale />} />
          <Route path="/sale/edit/:id" element={<AddEditSale />} />
          <Route path="/sale/:id" element={<SaleDetail />} />
          <Route path="/sell/:id" element={<ProtectedRoute fullAccessOnly><SellFromStock /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute fullAccessOnly><Clients /></ProtectedRoute>} />
          <Route path="/conta" element={<Account />} />
          <Route path="/conta/criar" element={<ProtectedRoute fullAccessOnly><CreateUser /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
