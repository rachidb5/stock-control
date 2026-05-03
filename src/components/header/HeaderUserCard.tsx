import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type AppUser, roleLabels } from "@/stores/useSessionStore";

interface HeaderUserCardProps {
  user: AppUser;
  initials: string;
}

export function HeaderUserCard({ user, initials }: HeaderUserCardProps) {
  return (
    <Card className="rounded-xl border-border/60 bg-card/95 shadow-none lg:h-16">
      <CardContent className="flex items-center gap-3 p-3 lg:h-full">
        <Avatar className="h-10 w-10 ring-2 ring-primary/10">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground sm:text-[15px]">
              {user.name}
            </p>
            <Badge variant="secondary" className="h-6 shrink-0 whitespace-nowrap px-2 text-[11px] font-medium">
              {roleLabels[user.role]}
            </Badge>
          </div>

          <div className="mt-1 flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
            <span className="h-2 w-2 shrink-0 rounded-full bg-success shadow-sm shadow-success/30" />
            <span className="truncate whitespace-nowrap font-medium text-foreground/80">
              {user.email}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
