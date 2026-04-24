import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Clock3, StopCircle } from "lucide-react";

interface HeaderTimeClockCardProps {
  isOpen: boolean;
  liveWorkedLabel: string;
  openSinceLabel: string | null;
  onToggle: () => void;
}

export function HeaderTimeClockCard({
  isOpen,
  liveWorkedLabel,
  openSinceLabel,
  onToggle,
}: HeaderTimeClockCardProps) {
  return (
    <Card className="rounded-2xl border-border/60 bg-background/95 shadow-sm lg:h-16">
      <CardContent className="flex flex-col gap-2.5 p-3 sm:flex-row sm:items-center sm:justify-between lg:h-full">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Ponto
            </span>
            <span
              className={cn(
                "inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
                isOpen
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {isOpen ? "Ativo" : "Inativo"}
            </span>
            {isOpen && openSinceLabel ? (
              <span className="truncate text-[11px] text-muted-foreground">
                Desde {openSinceLabel}
              </span>
            ) : null}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <div
              className={cn(
                "rounded-lg p-1.5",
                isOpen
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-primary/10 text-primary",
              )}
            >
              {isOpen ? <StopCircle className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
            </div>
            <p className="text-lg font-semibold tabular-nums text-foreground">
              {liveWorkedLabel}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant={isOpen ? "destructive" : "default"}
          onClick={onToggle}
          className="h-9 rounded-xl px-3.5 text-[11px] font-medium whitespace-nowrap"
        >
          {isOpen ? (
            <>
              <StopCircle className="mr-1.5 h-4 w-4" />
              Encerrar
            </>
          ) : (
            <>
              <Clock3 className="mr-1.5 h-4 w-4" />
              Registrar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
