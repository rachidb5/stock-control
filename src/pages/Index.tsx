import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { selectCurrentUser, useSessionStore } from "@/stores/useSessionStore";
import { ArrowRight, Package, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

function getTimeGreeting(referenceDate = new Date()) {
  const hour = referenceDate.getHours();

  if (hour < 12) {
    return "Bom dia";
  }

  if (hour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

export default function Index() {
  const navigate = useNavigate();
  const currentUser = useSessionStore(selectCurrentUser);
  const firstName = currentUser.name.trim().split(" ")[0] ?? currentUser.name;
  const [timeGreeting, setTimeGreeting] = useState(() => getTimeGreeting());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeGreeting(getTimeGreeting());
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-220px)] items-center justify-center">
        <div className="w-full max-w-5xl space-y-8">
          <div className="space-y-3 text-center">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {`Olá ${firstName}, ${timeGreeting}.`}
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
              Acesse rapidamente as duas ações principais do seu dia: iniciar uma venda ou consultar o estoque.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/sale/add")}
              className="group relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary to-primary/80 p-8 text-left text-primary-foreground shadow-lg transition-transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4">
                  <span className="inline-flex w-fit whitespace-nowrap rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] sm:text-xs">
                    Operação principal
                  </span>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-semibold">Iniciar Venda</h3>
                    <p className="max-w-sm text-sm text-primary-foreground/80">
                      Abra uma nova negociação, registre valores e avance direto para o fechamento.
                    </p>
                  </div>
                </div>
                <ShoppingCart className="h-8 w-8 shrink-0 transition-transform group-hover:translate-x-1" />
              </div>
              <div className="mt-10 flex items-center gap-2 text-sm font-medium">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/stock")}
              className="group relative overflow-hidden rounded-[2rem] border border-border/70 bg-card p-8 text-left shadow-sm transition-transform hover:-translate-y-1 hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4">
                  <span className="inline-flex w-fit whitespace-nowrap rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
                    Consulta rápida
                  </span>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-semibold">Consultar Estoque</h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Verifique disponibilidade, detalhe os aparelhos e identifique oportunidades antes de ofertar.
                    </p>
                  </div>
                </div>
                <Package className="h-8 w-8 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
              </div>
              <div className="mt-10 flex items-center gap-2 text-sm font-medium text-primary">
                Ver estoque
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
