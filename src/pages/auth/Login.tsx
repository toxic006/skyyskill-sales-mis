import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldCheck, BarChart3, Zap, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useAuthStore, type Role, ROLE_ROUTES } from "@/store/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const roles: Role[] = ["Admin", "Sales Manager", "Marketing", "Finance"];

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);

  const [email, setEmail] = useState("sk.tausif@skyyskill.com");
  const [password, setPassword] = useState("demo1234");
  const [role, setRole] = useState<Role>("Admin");
  const [remember, setRemember] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={ROLE_ROUTES[user.role][0]} replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const next: typeof errors = {};
      parsed.error.issues.forEach((i) => { next[i.path[0] as "email" | "password"] = i.message; });
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      login(parsed.data.email, role, remember);
      toast.success(`Welcome back, ${parsed.data.email.split("@")[0]}!`);
      navigate(ROLE_ROUTES[role][0]);
    }, 600);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 mb-10">
            <img src="/skyyskill-logo.png" alt="SkyySkill" className="h-10 w-auto" />
            <div>
              <p className="font-bold tracking-tight">SkyySkill</p>
              <p className="text-[11px] text-muted-foreground -mt-0.5">Sales MIS</p>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Sign in to your workspace to continue managing your business.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="text-xs font-semibold mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  maxLength={255}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-lg bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition"
                  placeholder="you@company.com"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-semibold">Password</label>
                <button type="button" className="text-xs text-primary hover:underline" onClick={() => toast.info("Password reset link sent (demo)")}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  maxLength={100}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 rounded-lg bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle password">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block">Sign in as</label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer select-none pt-1">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
              <span className="text-muted-foreground">Keep me signed in for 30 days</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-95 hover:shadow-glow transition-all disabled:opacity-60"
            >
              {loading ? "Signing in…" : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Demo credentials are pre-filled. No real account needed.
          </p>
        </div>
      </div>

      <div className="hidden lg:block relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(258_90%_75%/0.4),transparent_50%),radial-gradient(circle_at_70%_70%,hsl(188_95%_60%/0.35),transparent_50%)]" />
        <div className="relative h-full flex flex-col justify-between p-12 text-primary-foreground">
          <div className="text-sm font-medium opacity-80">SkyySkill internal sales platform</div>
          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              One workspace for the entire SkyySkill sales organisation.
            </h2>
            <div className="space-y-3 pt-4">
              {[
                { icon: BarChart3, title: "Real-time insights", desc: "ROAS, revenue, GST — all in one place." },
                { icon: Zap, title: "Built for speed", desc: "Lightning-fast filters, exports, and search." },
                { icon: ShieldCheck, title: "Role-based", desc: "Admin, Sales, Marketing, Finance views." },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur grid place-items-center shrink-0">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{f.title}</p>
                    <p className="text-xs opacity-75">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs opacity-75">
            <div className="flex -space-x-2">
              {["A", "P", "R", "V"].map((c, i) => (
                <div key={i} className="h-7 w-7 rounded-full bg-white/20 backdrop-blur grid place-items-center text-[10px] font-bold ring-2 ring-primary">{c}</div>
              ))}
            </div>
            <span>Used by Sales, Marketing &amp; Finance teams at SkyySkill</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
