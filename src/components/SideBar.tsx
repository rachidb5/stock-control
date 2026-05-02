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
import { BarChart3, Factory, House, Package, User, UserPlus, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  const menuSections = [
    {
      label: "Operacao",
      items: [
        { title: "Home", url: "/", icon: House },
        { title: "Produtos", url: "/produtos", icon: Package },
        { title: "Painel Comercial", url: "/painel-comercial", icon: BarChart3 },
      ],
    },
    {
      label: "Cadastros",
      items: [
        { title: "Clientes", url: "/clients", icon: Users },
        { title: "Fornecedores", url: "/fornecedores", icon: Factory },
        { title: "Usuarios", url: "/conta/criar", icon: UserPlus },
      ],
    },
    {
      label: "Conta",
      items: [{ title: "Minha conta", url: "/conta", icon: User }],
    },
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === "/produtos" &&
      (location.pathname.startsWith("/produto") ||
        location.pathname.startsWith("/sale") ||
        location.pathname.startsWith("/sell")));

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
