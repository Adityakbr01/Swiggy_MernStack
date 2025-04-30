import { Outlet } from "react-router-dom";
import { RiderSidebar } from "../app-sidebar-Rider";

export default function RiderLayout() {
  return (
    <div className="flex min-h-screen w-screen">
      <RiderSidebar />
      <main className="w-full h-screen overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
