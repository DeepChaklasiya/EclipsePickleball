import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please sign in to access this page");
      navigate("/");
    }
  }, [navigate]);

  return isAuthenticated() ? <>{children}</> : null;
};

export default ProtectedRoute;
