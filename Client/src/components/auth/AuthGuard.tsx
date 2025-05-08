import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
}

interface User {
  role: "admin" | "restaurant" | "rider" | "user";
  [key: string]: any;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Debug logs only in development
  if (process.env.NODE_ENV !== "production") {
    console.log("Current Pathname:", pathname, "IsAuthenticated:", isAuthenticated);
  }

  useEffect(() => {
    const checkAuth = () => {
      const userRaw = localStorage.getItem("Food-App-user");
      let user: User | null = null;

      console.log("userRaw:", userRaw);

      // Parse user data
      try {
        user = userRaw ? JSON.parse(userRaw) : null;
        console.log("user:", user);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("Food-App-user");
        toast.error("Invalid user data. Please log in again.");
        navigate("/auth/login");
        return;
      }

      // Routes aligned with App.tsx
      const publicRoutes = [
        "/",
        "/auth/login",
        "/auth/register",
        "/search",
        "/restaurant/:id",
        "/cart",
        "/track-order/:id",
      ];

      const protectedRoutes = [
        "/orders",
        "/profile",
      ];

      const adminRoutes = [
        "/add-product",
        "/user-management",
        "/admin/dashboard",
        "/edit-product",
        "/admin",
        "/admin/inquiry-panel",
      ];

      const restaurantRoutes = [
        "/restaurant/dashboard",
        "/restaurant/dashboard/orders",
        "/restaurant/dashboard/settings",
        "/restaurant/dashboard/menu",
        "/restaurant/dashboard/add-menu",
        "/restaurant/dashboard/update-menu/:id",
        "/restaurant/dashboard/add-restaurant",
      ];

      const riderRoutes = [
        "/rider/dashboard",
        "/rider/dashboard/orders",
        "/rider/dashboard/settings",
      ];

      // Function to match routes, including dynamic and wildcard routes
      const matchRoute = (routes: string[], path: string): boolean => {
        return routes.some((route) => {
          // Handle dynamic routes (e.g., /restaurant/:id, /track-order/:id)
          if (route.includes(":id")) {
            const baseRoute = route.replace(":id", "");
            return path.startsWith(baseRoute) && path !== baseRoute;
          }
          // Handle wildcard routes (e.g., /restaurant/dashboard/*)
          if (route.endsWith("/*")) {
            return path.toLowerCase().startsWith(route.replace("/*", "").toLowerCase());
          }
          // Exact match
          return route.toLowerCase() === path.toLowerCase();
        });
      };

      // Authentication and role-based checks
      if (!user && matchRoute(protectedRoutes, pathname)) {
        toast.error("Please log in to access this page.");
        navigate("/auth/login");
      } else if (!user && !matchRoute(publicRoutes, pathname)) {
        toast.error("Please log in to access this page.");
        navigate("/auth/login");
      } else if (user && matchRoute(["/auth/login", "/auth/register"], pathname)) {
        navigate("/");
      } else if (matchRoute(adminRoutes, pathname) && user?.role !== "admin") {
        toast.error("Admin access required.");
        navigate("/?error=Admin%20access%20required");
      } else if (matchRoute(restaurantRoutes, pathname) && user?.role !== "restaurant") {
        toast.error("Restaurant access required.");
        navigate("/?error=Restaurant%20access%20required");
      } else if (matchRoute(riderRoutes, pathname) && user?.role !== "rider") {
        toast.error("Rider access required.");
        navigate("/?error=Rider%20access%20required");
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [navigate, pathname]);

  // Show loading spinner while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;