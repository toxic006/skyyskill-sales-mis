import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useUIStore } from "@/store/ui";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import Dashboard from "./pages/dashboard/Dashboard";
import Orders from "./pages/orders/Orders";
import Marketing from "./pages/marketing/Marketing";
import Targets from "./pages/targets/Targets";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 30_000 } },
});

const ThemeBoot = ({ children }: { children: React.ReactNode }) => {
  const theme = useUIStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeBoot>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/targets" element={<Targets />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeBoot>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
