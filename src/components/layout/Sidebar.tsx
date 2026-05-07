import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Megaphone, Target, ChevronLeft } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useAuthStore, canAccess } from "@/store/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/marketing", label: "Marketing", icon: Megaphone },
  { to: "/targets", label: "Targets", icon: Target },
];

export const Sidebar = () => {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);
  const role = useAuthStore((s) => s.user?.role);
  const { pathname } = useLocation();
  const visibleItems = navItems.filter((i) => canAccess(role, i.to));

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-smooth",
        collapsed ? "w-[76px]" : "w-[248px]"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <img src="/skyyskill-logo.png" alt="SkyySkill" className={cn("w-auto shrink-0 object-contain", collapsed ? "h-8" : "h-9")} />
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-bold tracking-tight text-sm">SkyySkill</p>
              <p className="text-[11px] text-muted-foreground">Sales MIS</p>
            </div>
          )}
        </div>
        <button
          onClick={toggle}
          className="hidden md:grid place-items-center h-7 w-7 rounded-md hover:bg-sidebar-accent transition-colors"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {!collapsed && (
          <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
        )}
        {visibleItems.map((item) => {
          const active = pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r gradient-primary" />
              )}
              <item.icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

    </aside>
  );
};
