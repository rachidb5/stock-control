import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Factory,
  House,
  Package,
  ShoppingCart,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  hasFullAccess,
  selectCurrentUser,
  useSessionStore,
} from "@/stores/useSessionStore";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const currentUser = useSessionStore(selectCurrentUser);
  const fullAccess = hasFullAccess(currentUser);

  const menuSections = [
    fullAccess
      ? {
          label: "Operacao",
          items: [
            { title: "Home", url: "/", icon: House },
            { title: "Produtos", url: "/produtos", icon: Package },
            {
              title: "Painel Comercial",
              url: "/painel-comercial",
              icon: BarChart3,
            },
          ],
        }
      : {
          label: "Vendas",
          items: [
            {
              title: "Minhas vendas",
              url: "/produtos?tab=vendas",
              icon: ShoppingCart,
            },
            {
              title: "Registrar venda",
              url: "/sale/add",
              icon: ShoppingCart,
            },
          ],
        },
    ...(fullAccess
      ? [
          {
            label: "Cadastros",
            items: [
              { title: "Clientes", url: "/clients", icon: Users },
              { title: "Fornecedores", url: "/fornecedores", icon: Factory },
              { title: "Usuarios", url: "/conta/criar", icon: UserPlus },
            ],
          },
        ]
      : []),
    {
      label: "Conta",
      items: [{ title: "Minha conta", url: "/conta", icon: User }],
    },
  ];

  const isActive = (path: string) => {
    const pathOnly = path.split("?")[0];

    if (location.pathname === pathOnly) {
      return true;
    }

    if (fullAccess && pathOnly === "/produtos") {
      return (
        location.pathname.startsWith("/produto") ||
        location.pathname.startsWith("/sale") ||
        location.pathname.startsWith("/sell")
      );
    }

    if (!fullAccess && pathOnly === "/sale/add") {
      return location.pathname.startsWith("/sale");
    }

    return false;
  };

  const navigateTo = (url: string) => {
    navigate(url);
    setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/80">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="rounded-xl bg-primary p-2 text-primary-foreground shadow-sm shadow-primary/20">
            <Package className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 space-y-1">
              <span className="block truncate text-lg font-semibold">StockControl</span>
              <p className="text-xs text-muted-foreground">
                Operacao, clientes e performance em um so lugar
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {menuSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                      onClick={() => navigateTo(item.url)}
                      className="h-10 rounded-lg"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
