import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  CalendarClock,
  Sparkles,
  BarChart3,
  Search,
  Brain,
  Network,
  Bell,
  User,
  Settings,
  Scale,
  Globe,
  Server,
} from "lucide-react";
import { systemApi } from "@/lib/api";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const workspace = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Cases", url: "/cases", icon: Briefcase },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Timeline", url: "/timeline", icon: CalendarClock },
];

const intelligence = [
  { title: "AI Assistant", url: "/assistant", icon: Sparkles },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Precedent Search", url: "/precedents", icon: Search },
  { title: "AI Memory", url: "/memory", icon: Brain },
  { title: "Pattern Analysis", url: "/patterns", icon: Network },
];

const account = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const backendStatus = useQuery({
    queryKey: ["system", "health"],
    queryFn: systemApi.health,
    refetchInterval: 30000,
    retry: 1,
  });
  const backendSynced = backendStatus.data?.status === "ok";

  const renderGroup = (label: string, items: typeof workspace) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-eyebrow">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                  <Link to={item.url} className="group/nav gap-3">
                    <item.icon
                      className={
                        active
                          ? "h-4 w-4 text-primary"
                          : "h-4 w-4 text-muted-foreground transition-colors group-hover/nav:text-foreground"
                      }
                    />
                    {!collapsed && <span className="truncate text-sm">{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-1.5 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Scale className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display text-base leading-none font-semibold">jurisAssist</p>
              <p className="mt-1 truncate text-[11px] text-muted-foreground">Legal Intelligence</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {renderGroup("Workspace", workspace)}
        {renderGroup("Intelligence", intelligence)}
        {renderGroup("Account", account)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground">
              <span
                className={
                  backendSynced
                    ? "h-2 w-2 rounded-full bg-emerald-500"
                    : backendStatus.isLoading
                      ? "h-2 w-2 rounded-full bg-amber-500"
                      : "h-2 w-2 rounded-full bg-destructive"
                }
              />
              <Server className="h-3.5 w-3.5" />
              <span>
                {backendSynced
                  ? "Backend active"
                  : backendStatus.isLoading
                    ? "Checking backend"
                    : "Backend inactive"}
              </span>
            </div>
            <Link
              to="/landing"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>View marketing site</span>
            </Link>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <span
              className={
                backendSynced
                  ? "h-2 w-2 rounded-full bg-emerald-500"
                  : backendStatus.isLoading
                    ? "h-2 w-2 rounded-full bg-amber-500"
                    : "h-2 w-2 rounded-full bg-destructive"
              }
            />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
