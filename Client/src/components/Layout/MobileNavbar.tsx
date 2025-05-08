// src/components/MobileNavbar.tsx

import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Badge } from "@/components/ui/badge";

export function MobileNavbar() {
  const location = useLocation();
  const cartItemCount = 0;
  const { user } = useSelector((state: RootState) => state.auth);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
    },
    {
      href: "/search",
      icon: Search,
      label: "Search",
    },
    {
      href: "/orders",
      icon: ShoppingBag,
      label: "Orders",
      badge: cartItemCount > 0 ? cartItemCount : null,
    },
    {
      href: "/profile",
      icon: User,
      label: "Profile",
      avatar: user?.profileImage,
    },
  ];

  // ❌ Hide navbar on these paths
  const hiddenPaths = ["/auth/login", "/auth/register"];
  const shouldHide = 
    hiddenPaths.includes(location.pathname.toLowerCase()) ||
    location.pathname.startsWith("/restaurant") ||
    location.pathname.startsWith("/rider");

  if (shouldHide) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-10">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex flex-col items-center justify-center gap-1 text-xs w-1/4 h-full relative ${
              isActive(item.href) ? "text-rose-500" : "text-muted-foreground"
            }`}
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative">
              {item.badge && (
                <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 bg-rose-500 text-[10px]">
                  {item.badge}
                </Badge>
              )}
              <item.icon className="h-5 w-5" />
            </motion.div>
            <span>{item.label}</span>
            {isActive(item.href) && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 h-1 w-1/2 bg-rose-500 rounded-t-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
