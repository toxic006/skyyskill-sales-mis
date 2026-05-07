import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore, canAccess, ROLE_ROUTES } from "@/store/auth";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!canAccess(user.role, location.pathname)) {
    return <Navigate to={ROLE_ROUTES[user.role][0]} replace />;
  }
  return <>{children}</>;
};
