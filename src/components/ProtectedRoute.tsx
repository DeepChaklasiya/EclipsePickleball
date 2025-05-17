import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname === "/admin";

  useEffect(() => {
    // Allow Admin page to handle its own authentication
    if (isAdminRoute) {
      return;
    }

    // For all other protected routes, require authentication
    if (!isAuthenticated()) {
      toast.error("Please sign in to access this page");
      navigate("/");
    }
  }, [navigate, isAdminRoute, location.pathname]);

  // If this is the admin route, render children regardless of authentication status
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // For all other routes, only render children if authenticated
  return isAuthenticated() ? <>{children}</> : null;
};

export default ProtectedRoute;
