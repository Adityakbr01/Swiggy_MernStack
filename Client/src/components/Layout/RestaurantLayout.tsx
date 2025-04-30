import { AppSidebar } from "@/components/app-sidebar";
import { Outlet } from "react-router-dom";

export default function RestaurantLayout() {
  return (
    <div className="flex min-h-screen w-screen">
      <AppSidebar />
      <main className="w-full h-screen overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
