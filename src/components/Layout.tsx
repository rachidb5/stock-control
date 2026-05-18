import { useEffect, useMemo, useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/SideBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { HeaderTimeClockCard } from "@/components/header/HeaderTimeClockCard";
import { HeaderUserCard } from "@/components/header/HeaderUserCard";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { selectCurrentUser, useSessionStore } from "@/stores/useSessionStore";
import { useTimeClockStore } from "@/stores/useTimeClockStore";
import { formatDuration, formatTime, getOpenTimeClockEntry, getTodayWorkedMs } from "@/lib/timeClock";
import { User } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = useSessionStore(selectCurrentUser);
  const entries = useTimeClockStore((state) => state.entries);
  const clockIn = useTimeClockStore((state) => state.clockIn);
  const clockOut = useTimeClockStore((state) => state.clockOut);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const initials = currentUser.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const openEntry = useMemo(
    () => getOpenTimeClockEntry(entries, currentUser.id),
    [entries, currentUser.id],
  );
  const openSinceLabel = useMemo(
    () => (openEntry ? formatTime(openEntry.clockIn) : null),
    [openEntry],
  );
  const todayWorked = useMemo(
    () => getTodayWorkedMs(entries, currentUser.id, now),
    [entries, currentUser.id, now],
  );
  const liveWorkedLabel = useMemo(() => {
    const totalSeconds = Math.floor(todayWorked / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  }, [todayWorked]);

  const handleTimeClock = () => {
    if (openEntry) {
      clockOut(currentUser.id);
      setNow(new Date());
      toast({
        title: "Saída registrada",
        description: `Expediente encerrado com ${formatDuration(todayWorked)} no dia.`,
      });
      return;
    }

    clockIn(currentUser.id);
    setNow(new Date());
    toast({
      title: "Entrada registrada",
      description: "Seu ponto foi iniciado e o contador já está em andamento.",
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full min-w-0">
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <header className="sticky top-0 z-30 border-b bg-background/90 shadow-sm backdrop-blur-xl">
            <div className="mx-auto w-full max-w-[1500px] px-3 py-3 sm:px-4">
              <div className="mb-3 flex items-center justify-between md:hidden">
                <SidebarTrigger className="h-10 w-10 rounded-xl border border-border/70 bg-background shadow-sm" />
                <div className="rounded-xl border border-border/70 bg-background shadow-sm">
                  <ThemeToggle className="h-10 w-10" />
                </div>
              </div>
              <div className="grid gap-2 lg:grid-cols-[minmax(0,18rem)_minmax(0,19rem)_auto] lg:items-center">
                <div className="min-w-0">
                  <HeaderUserCard user={currentUser} initials={initials} />
                </div>

                <div className="min-w-0">
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/conta")}
                    className="h-10 w-full rounded-xl border-border/70 bg-background px-3 text-xs whitespace-nowrap shadow-sm sm:w-auto"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Minha conta
                  </Button>
                  <div className="hidden rounded-xl border border-border/70 bg-background shadow-sm md:block">
                    <ThemeToggle className="h-10 w-10" />
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="mx-auto min-w-0 w-full max-w-[1500px] flex-1 overflow-x-hidden p-3 sm:p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
