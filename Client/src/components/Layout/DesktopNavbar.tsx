import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useScrollDirection } from "@/hooks/useScrollDirection"; 

const navItems = [
  { name: "Home", path: "/" },
  { name: "Explore", path: "/search" },
  { name: "Orders", path: "/orders" },
  { name: "My Account", path: "/profile" },
];

export const DesktopNavbar = () => {
  const location = useLocation();
  const { items } = useSelector((state: RootState) => state.cart);
  const { scrollDirection } = useScrollDirection(); 

  const hiddenPaths = ["/auth/login", "/auth/register"];
  const shouldHideNavbar =
    hiddenPaths.includes(location.pathname.toLowerCase()) ||
    location.pathname.startsWith("/restaurant") ||
    location.pathname.startsWith("/rider");

  if (shouldHideNavbar) return null;

  return (
    <motion.nav
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: scrollDirection === "down" ? -100 : 0,
        opacity: scrollDirection === "down" ? 0 : 1,
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="hidden lg:flex justify-between items-center px-10 py-5 bg-white/99 border-b fixed left-0 right-0 top-0 z-50 shadow-sm"
    >
      {/* Logo / Brand */}
      <Link to="/" className="text-3xl font-extrabold tracking-tight text-gray-900">
        <motion.span whileHover={{ scale: 1.05 }} className="flex items-center gap-1">
          🍽️{" "}
          <span className="text-primary">
            Foodie<span className="text-rose-500">Xpress</span>
          </span>
        </motion.span>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.name}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-white shadow-md hover:bg-primary/90"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {item.name}
                </Button>
              </Link>
            </motion.div>
          );
        })}

        {/* Cart Icon */}
        <div className="relative">
          <Link
            to="/cart"
            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-all"
          >
            <ShoppingCart size={24} className="text-primary" />
            {items.length > 0 && (
              <span className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold rounded-full px-2 py-1">
                {items.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};
