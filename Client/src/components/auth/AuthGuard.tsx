import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, Location } from "react-router-dom";
import { ROUTES, CUSTOMER_ROUTES, RESTRICTED_ROLES_FOR_CUSTOMER_ROUTES } from "@/utils/routesConfig";
import { matchRoute } from "@/utils/matchRoute";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";

// Define a custom Location interface with state
interface CustomLocation extends Location {
  state: {
    from?: string;
  } | null;
}

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation() as CustomLocation;
  const navigate = useNavigate();
  const { user, isLoading } = useUser();
  const hasNavigated = useRef(false); // Track navigation to prevent loops

  if (process.env.NODE_ENV !== "production") {
    console.log("AuthGuard Debug:", {
      pathname: location.pathname,
      user,
      role: user?.role,
      isLoading,
    });
  }

  const RIDER_ROUTES = [
    "/rider/dashboard",
    "/rider/dashboard/orders",
    "/rider/dashboard/settings",
  ];

  const RESTAURANT_ROUTES = [
    "/restaurant/dashboard",
    "/restaurant/dashboard/orders",
    "/restaurant/dashboard/settings",
    "/restaurant/dashboard/menu",
    "/restaurant/dashboard/add-menu",
    "/restaurant/dashboard/update-menu/:id",
    "/restaurant/dashboard/add-restaurant",
    "/restaurant/dashboard/update-restaurant",
  ];

  const checks = useMemo(() => {
    return [
      // Check 1: Redirect unauthenticated users to login
      {
        condition: !user && location.pathname !== ROUTES.LOGIN && location.pathname !== ROUTES.REGISTER && !isLoading,
        action: () => {
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            toast.error("Please login first.");
            navigate(ROUTES.LOGIN, { state: { from: location.pathname } });
          }
        },
      },
      // Check 2: Restrict customer-only routes
      {
        condition:
          matchRoute(CUSTOMER_ROUTES, location.pathname) &&
          user &&
          user.role &&
          RESTRICTED_ROLES_FOR_CUSTOMER_ROUTES.includes(user.role),
        action: () => {
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            toast.error("Access denied: Customers only.");
            if (user?.role === "rider") {
              navigate("/rider/dashboard", { replace: true });
            } else if (user?.role === "restaurant") {
              navigate("/restaurant/dashboard", { replace: true });
            } else {
              // navigate(ROUTES.HOME, { replace: true });
            }
          }
        },
      },
      // Check 3: Redirect authenticated users from login/register
      {
        condition:
          user &&
          ["/auth/Login", "/auth/Register"].includes(location.pathname),
        action: () => {
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            const getRedirectPath = (role: string | null | undefined) => {
              switch (role) {
                case "rider":
                  return "/rider/dashboard";
                case "restaurant":
                  return "/restaurant/dashboard";
                case "customer":
                  return ROUTES.HOME;
                default:
                  return ROUTES.HOME; // Handles null or undefined
              }
            };
            const from = location.state?.from || getRedirectPath(user?.role); // Fallback to ROUTES.HOME
            navigate(from, { replace: true });
          }
        },
      },
      // Check 4: Restrict rider-only routes
      {
        condition:
          matchRoute(RIDER_ROUTES, location.pathname) &&
          user &&
          user.role !== "rider",
        action: () => {
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            toast.error("Access denied: Rider role required.");
            navigate(ROUTES.HOME, { replace: true });
          }
        },
      },
      // Check 5: Restrict restaurant-only routes
      {
        condition:
          matchRoute(RESTAURANT_ROUTES, location.pathname) &&
          user &&
          user.role !== "restaurant",
        action: () => {
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            toast.error("Access denied: Restaurant role required.");
            navigate(ROUTES.HOME, { replace: true });
          }
        },
      },
      // Check 6: Handle generic /dashboard redirect
      {
        condition: location.pathname === "/dashboard" && user,
        action: () => {
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            if (user?.role === "rider") {
              navigate("/rider/dashboard", { replace: true });
            } else if (user?.role === "restaurant") {
              navigate("/restaurant/dashboard", { replace: true });
            } else {
              navigate(ROUTES.HOME, { replace: true });
            }
          }
        },
      },
    ];
  }, [user, isLoading, location, navigate]);

  useEffect(() => {
    if (isLoading) return;
    hasNavigated.current = false; // Reset navigation flag on new route or user change
    for (let check of checks) {
      if (check.condition) {
        check.action();
        break;
      }
    }
  }, [checks, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;