import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type AppUser, roleLabels } from "@/stores/useSessionStore";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";

interface HeaderUserCardProps {
  user: AppUser;
  initials: string;
}

const roleBadgeStyles: Record<AppUser["role"], string> = {
  admin: "border-primary/20 bg-primary/10 text-primary",
  gestor: "border-accent/20 bg-accent/10 text-accent",
  vendedor: "border-border/80 bg-secondary text-muted-foreground",
};

export function HeaderUserCard({ user, initials }: HeaderUserCardProps) {
  return (
    <Card className="overflow-hidden rounded-lg border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md lg:h-16">
      <CardContent className="flex h-full min-w-0 items-center gap-3 p-3">
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10 border border-primary/15 ring-4 ring-primary/5">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success shadow-sm"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-semibold leading-tight text-foreground sm:text-[15px]">
              {user.name}
            </p>
            <Badge
              variant="outline"
              className={cn(
                "h-5 max-w-[7rem] shrink-0 truncate rounded-md px-1.5 text-[10px] font-semibold leading-none",
                roleBadgeStyles[user.role],
              )}
            >
              {roleLabels[user.role]}
            </Badge>
          </div>

          <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 truncate whitespace-nowrap font-medium">
              {user.email}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
