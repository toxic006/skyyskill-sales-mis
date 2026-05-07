import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Megaphone, Target, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore, canAccess } from "@/store/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/marketing", label: "Marketing", icon: Megaphone },
  { to: "/targets", label: "Targets", icon: Target },
];

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);
  const role = useAuthStore((s) => s.user?.role);
  const { pathname } = useLocation();
  const items = navItems.filter((i) => canAccess(role, i.to));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="md:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-0 bg-sidebar">
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-sidebar-border">
          <img src="/skyyskill-logo.png" alt="SkyySkill" className="h-9 w-auto" />
          <div className="leading-tight">
            <p className="font-bold tracking-tight text-sm">SkyySkill</p>
            <p className="text-[11px] text-muted-foreground">Sales MIS</p>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
          {items.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
