import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
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
          <Route path="/stock" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/stock/add" element={<AddEditStock />} />
          <Route path="/stock/edit/:id" element={<AddEditStock />} />
          <Route path="/stock/:id" element={<StockDetail />} />
          <Route path="/sale/add" element={<AddEditSale />} />
          <Route path="/sale/edit/:id" element={<AddEditSale />} />
          <Route path="/sale/:id" element={<SaleDetail />} />
          <Route path="/sell/:id" element={<SellFromStock />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/conta" element={<Account />} />
          <Route path="/conta/criar" element={<CreateUser />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
