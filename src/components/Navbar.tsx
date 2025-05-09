import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { isAuthenticated, logout, getUser } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Define paddle animation keyframes
const paddleAnimations = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  
  @keyframes slowRotate {
    0% { transform: rotate(-10deg); }
    50% { transform: rotate(10deg); }
    100% { transform: rotate(-10deg); }
  }
  
  @keyframes ballBounce {
    0% { transform: translateY(0); }
    20% { transform: translateY(-12px); }
    40% { transform: translateY(0); }
    60% { transform: translateY(-8px); }
    80% { transform: translateY(0); }
    100% { transform: translateY(0); }
  }
  
  @keyframes textGlow {
    0%, 100% { text-shadow: 0 0 5px rgba(255, 165, 0, 0.5); }
    50% { text-shadow: 0 0 15px rgba(255, 165, 0, 0.8), 0 0 20px rgba(255, 165, 0, 0.5); }
  }
  
  .paddle-container {
    animation: slowRotate 3s ease-in-out infinite;
    transform-origin: bottom right;
  }
  
  .ball-bounce {
    animation: ballBounce 2s ease-in-out infinite;
  }
  
  .eclipse-text {
    animation: textGlow 3s ease-in-out infinite;
  }
`;

interface NavbarProps {
  variant?: "default" | "cosmic";
}

const Navbar = ({ variant = "default" }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Get user name for display
    const user = getUser();
    if (user) {
      setUserName(user.name);
    }
  }, [location.pathname]); // Refresh when path changes

  // Add animation styles when component mounts
  useEffect(() => {
    // Create style element for paddle animations
    const styleElement = document.createElement("style");
    styleElement.innerHTML = paddleAnimations;
    document.head.appendChild(styleElement);

    // Cleanup function
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const isCosmicVariant = variant === "cosmic" || location.pathname === "/";
  const authenticated = isAuthenticated();

  const handleProfileClick = () => {
    if (authenticated) {
      navigate("/profile");
    } else {
      navigate("/");
    }
  };

  const handleSignOut = () => {
    logout();
    toast.success("You have been signed out");
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav
        className={cn(
          "px-4 py-3 flex items-center justify-between",
          isCosmicVariant
            ? "bg-[#03001C] border-b border-[#301E67]"
            : "bg-eclipse-dark border-b border-eclipse-purple"
        )}
      >
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative h-10 w-16 paddle-container">
              {/* Pickleball paddle */}
              <div className="absolute bottom-0 right-0 w-10 h-14 flex items-center justify-center">
                <div className="relative w-8 h-10">
                  {/* Paddle handle */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-amber-700 rounded-b-sm"></div>

                  {/* Paddle face */}
                  <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-md"></div>
                </div>
              </div>

              {/* Bouncing balls */}
              <div className="absolute top-0 left-0 space-y-1">
                <div
                  className="w-3 h-3 rounded-full bg-yellow-400 opacity-80 ball-bounce"
                  style={{ animationDelay: "0s" }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-yellow-400 opacity-80 ball-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-yellow-400 opacity-80 ball-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>

            <span className="font-semibold text-lg text-white eclipse-text">
              Eclipse
            </span>
          </Link>
        </div>

        {/* User menu */}
        <div>
          {authenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isCosmicVariant ? "cosmic" : "default"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <User size={16} />
                  <span className="hidden md:inline">
                    {userName || "Profile"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant={isCosmicVariant ? "cosmic" : "default"}
              size="sm"
              className="flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              <User size={16} />
              <span className="hidden md:inline">Sign In</span>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
