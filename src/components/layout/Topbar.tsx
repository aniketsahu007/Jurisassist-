import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Moon, Sun, Search, LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/lib/theme";
import { useNotifications } from "@/features/dashboard/useDashboard";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { theme, toggle } = useTheme();
  const { items, unread } = useNotifications();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const displayName = (user?.user_metadata?.full_name as string) ?? user?.email ?? "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/sign-up" });
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/85 px-3 backdrop-blur-md sm:px-5">
      <SidebarTrigger className="shrink-0" />

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search cases, statutes, judges…"
          className="h-9 bg-surface-2 pl-9 text-sm"
          aria-label="Global search"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <Badge variant="secondary">{unread} new</Badge>
            </div>
            <ul className="max-h-80 divide-y overflow-y-auto">
              {items.map((n) => (
                <li key={n.id} className="px-4 py-3 transition-colors hover:bg-muted/60">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                        n.level === "urgent" && "bg-destructive",
                        n.level === "info" && "bg-chart-3",
                        n.level === "success" && "bg-success",
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.detail}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <div className="ml-2 flex items-center border-l pl-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border bg-muted text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="User menu"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                {user?.email && (
                  <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
