import { Bell, Search, Sun, Moon, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { useSearchStore } from "@/store/search";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MobileSidebar } from "./MobileSidebar";

const initialNotifications = [
  { title: "New B2B order #NX-102912", desc: "Worth ₹1,24,000 from Acme Corp", time: "2m" },
  { title: "ROAS spike on 'Diwali Mega Sale'", desc: "ROAS jumped to 6.8x", time: "1h" },
  { title: "Target achieved", desc: "Priya Iyer hit 102% of monthly target", time: "3h" },
  { title: "Payment reconciliation", desc: "₹3.2L pending settlement", time: "Yesterday" },
];

export const Topbar = () => {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { query, setQuery } = useSearchStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [readIds, setReadIds] = useState<number[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  const unreadCount = initialNotifications.length - readIds.length;

  const placeholder = useMemo(() => {
    if (pathname.startsWith("/orders")) return "Search orders, customers…";
    if (pathname.startsWith("/marketing")) return "Search campaigns…";
    if (pathname.startsWith("/targets")) return "Search team or members…";
    return "Search the workspace…";
  }, [pathname]);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    navigate("/login");
  };

  const markAllRead = () => {
    setReadIds(initialNotifications.map((_, i) => i));
    toast.success("All notifications marked as read");
  };

  const initials = user?.name?.split(" ").map(s => s[0]).slice(0, 2).join("") ?? "U";

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="h-full px-3 md:px-6 flex items-center gap-2 md:gap-3">
        <MobileSidebar />

        <div className="relative flex-1 max-w-xl">
          <Search className="h-4 w-4 absolute left-3 md:left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full h-10 pl-9 md:pl-10 pr-3 md:pr-16 rounded-lg bg-secondary/60 border border-transparent focus:bg-background focus:border-border focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
          />
          <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[10px] font-medium text-muted-foreground bg-background border border-border rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </div>

        <div className="flex items-center gap-1 md:gap-1.5 ml-auto">
          <button
            onClick={toggleTheme}
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button className="relative h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary transition-colors">
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 p-0">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <p className="font-semibold text-sm">Notifications {unreadCount > 0 && <span className="ml-1 text-xs text-muted-foreground">({unreadCount})</span>}</p>
                <button
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className="text-xs text-primary hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {initialNotifications.map((n, i) => {
                  const isRead = readIds.includes(i);
                  return (
                    <div key={i} className="px-4 py-3 hover:bg-secondary/50 cursor-pointer border-b border-border/50 last:border-0">
                      <div className="flex items-start gap-2">
                        <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${isRead ? "bg-transparent" : "bg-primary"}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-tight ${isRead ? "font-normal text-muted-foreground" : "font-medium"}`}>{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          <div className="hidden sm:block h-6 w-px bg-border mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-1 pr-1.5 sm:pr-2 h-10 rounded-lg hover:bg-secondary transition-colors">
                <div className="h-8 w-8 rounded-lg gradient-primary text-primary-foreground grid place-items-center text-xs font-bold">
                  {initials}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-xs font-semibold">{user?.name ?? "Guest"}</p>
                  <p className="text-[10px] text-muted-foreground">{user?.role ?? "—"}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setProfileOpen(true)}>
                <User className="h-4 w-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Your profile</DialogTitle>
            <DialogDescription>Manage your personal details and workspace identity.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 mt-2">
            <div className="h-14 w-14 rounded-xl gradient-primary text-primary-foreground grid place-items-center text-base font-bold">
              {initials}
            </div>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          </div>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs">Full name</Label>
              <Input defaultValue={user?.name ?? ""} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input defaultValue={user?.email ?? ""} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Role</Label>
              <Input defaultValue={user?.role ?? ""} disabled className="mt-1" />
            </div>
          </div>
          <Button onClick={() => { toast.success("Profile updated"); setProfileOpen(false); }}>
            Save changes
          </Button>
        </DialogContent>
      </Dialog>

      {/* Settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Personalise the workspace to fit how you work.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-1">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-semibold">Dark mode</p>
                <p className="text-xs text-muted-foreground">Easier on the eyes at night.</p>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={() => toggleTheme()} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-semibold">Email notifications</p>
                <p className="text-xs text-muted-foreground">Daily digest & order alerts.</p>
              </div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-semibold">Push notifications</p>
                <p className="text-xs text-muted-foreground">Real-time updates in-browser.</p>
              </div>
              <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
            </div>
          </div>
          <Button onClick={() => { toast.success("Settings saved"); setSettingsOpen(false); }}>
            Save preferences
          </Button>
        </DialogContent>
      </Dialog>
    </header>
  );
};
