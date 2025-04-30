
import { Home, Package, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// Rider-specific menu items
const items = [
  {
    title: "Dashboard",
    url: "/rider/dashboard",
    icon: Home,
  },
  {
    title: "Orders",
    url: "/rider/dashboard/orders",
    icon: Package,
  },
  {
    title: "Settings",
    url: "/rider/dashboard/settings",
    icon: Settings,
  },
];

export function RiderSidebar() {
  const location = useLocation();

  return (
    <div className="Sidebar pt-10 w-56 min-w-56 bg-gradient-to-b from-amber-50 to-amber-100 border-r border-amber-200 shadow-lg h-screen">
      <h4 className="px-6 text-lg font-semibold text-amber-800 tracking-tight mb-7">
        Rider Dashboard
      </h4>

      <div className="flex flex-col gap-6">
        {items.map((item) => {
          const isActive = location.pathname === item.url;

          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex items-center gap-3 rounded-tl-md rounded-bl-md px-5 py-3 ml-3 font-medium transition-all ${
                isActive
                  ? "bg-amber-500/50 text-amber-900 hover:text-amber-950"
                  : "text-amber-800 hover:text-amber-950 hover:bg-amber-200/30"
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${
                  isActive ? "stroke-amber-900" : "stroke-amber-600"
                }`}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}