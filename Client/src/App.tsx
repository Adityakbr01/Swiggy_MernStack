import { MobileNavbar } from "@/components/Layout/MobileNavbar"; // 🟢 import your navbar
import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import "./App.css";
import RestaurantLayout from "./components/Layout/RestaurantLayout";
import RiderLayout from "./components/Layout/RiderLayout";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import AddMenuItem from "./pages/RestaurantDashboard/AddMenuItem";
import MenusDashboard from "./pages/RestaurantDashboard/MenusDashboard";
import AddRestaurant from "./pages/RestaurantDashboard/RestaurantAdd";
import RestaurantDashboard from "./pages/RestaurantDashboard/RestaurantDashboard";
import OrdersPage from "./pages/RestaurantDashboard/RestaurantOrders";
import RestaurantSetting from "./pages/RestaurantDashboard/RestaurantSetting";
import UpdateMenuItem from "./pages/RestaurantDashboard/UpdateMenuItem";
import RiderDashboard from "./pages/RiderDashboard/RiderDashboard";
import AvailableOrders from "./pages/RiderDashboard/RiderOrders";
import RiderSettings from "./pages/RiderDashboard/RiderSettings";
import { DesktopNavbar } from "./components/Layout/DesktopNavbar";
import OrdersPages from "./pages/OrdersPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import RestaurantPage from "./pages/RestaurantPage";
import CartPage from "./pages/CartPage";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import AuthGuard from "./components/auth/AuthGuard";
import UpdateRestaurant from "./pages/RestaurantDashboard/UpdateRestaurant";
import Main from "./pages/Main";


function AppWrapper() {
  const location = useLocation();

  // ❌ Pages jahan navbar nahi chahiye
  const hideNavbarRoutes = [
    "/auth/login",
    "/auth/register",
  ];

  // ❌ Prefixes jahan navbar nahi chahiye
  const hideNavbarPrefixes = [
    "/restaurant",
    "/rider"
  ];

  const shouldHideNavbar =
    hideNavbarRoutes.includes(location.pathname.toLowerCase()) ||
    hideNavbarPrefixes.some((prefix) => location.pathname.startsWith(prefix));

  return (
    <>
    {/* ✅ DESKTOP NAVBAR (only large screen) */}
    {!shouldHideNavbar && <DesktopNavbar />}
    <AuthGuard>
      <Routes>
        {/* access only customer */}
        <Route path="/" element={<Main />} />
        <Route path="/restaurant/:id" element={<RestaurantPage/>} />
        <Route path="/cart" element={< CartPage/>} />

        <Route path="/orders" element={ <OrdersPages/>} />
        <Route path="/orders/:id" element={<TrackOrderPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<ProfilePage />} />
     
        {/* access  any role */}
        <Route path="/auth/Register" element={<RegisterPage />} />
        <Route path="/auth/Login" element={<LoginPage />} />

        {/* Restaurant routes access only role==='restaurant' */}
        <Route path="/restaurant/dashboard" element={<RestaurantLayout />}>
          <Route index element={<RestaurantDashboard />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="settings" element={<RestaurantSetting />} />
          <Route path="menu" element={<MenusDashboard />} />
        </Route>
        <Route path="/restaurant/dashboard/update-menu/:id" element={<UpdateMenuItem />} />
        <Route path="/restaurant/dashboard/add-menu" element={<AddMenuItem />} />
        <Route path="/restaurant/dashboard/add-restaurant" element={<AddRestaurant />} />
        <Route path="/restaurant/dashboard/update-restaurant" element={<UpdateRestaurant />} />

        {/* Rider routes access only role==='rider' */}
        <Route path="/rider/dashboard" element={<RiderLayout />}>
          <Route index element={<RiderDashboard />} />
          <Route path="orders" element={<AvailableOrders />} />
          <Route path="settings" element={<RiderSettings />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </AuthGuard>
      {/* ✅ Show navbar conditionally */}
      {!shouldHideNavbar && <MobileNavbar />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
