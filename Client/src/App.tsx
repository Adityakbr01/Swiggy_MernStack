import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import RestaurantLayout from "./components/Layout/RestaurantLayout";
import HomePage from "./pages/HomePage";
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
import RiderLayout from "./components/Layout/RiderLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/Register" element={<RegisterPage />} />
        <Route path="/auth/Login" element={<LoginPage />} />
        {/* ----------------------------------------------------------------- */}
        {/* Restaurant routes */}
        <Route path="/restaurant/dashboard" element={<RestaurantLayout />}>
          <Route index element={<RestaurantDashboard />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="settings" element={<RestaurantSetting/>} />
          <Route path="menu" element={<MenusDashboard />} />
        </Route>
        <Route path="/restaurant/dashboard/update-menu/:id" element={<UpdateMenuItem />} />
        <Route path="/restaurant/dashboard/add-menu" element={<AddMenuItem />} />
        <Route path="/restaurant/dashboard/add-restaurant" element={<AddRestaurant />} />
        {/* End of Restaurant routes */}
        {/* ----------------------------------------------------------------- */}
        {/* Rider routes */}
        <Route path="/rider/dashboard" element={<RiderLayout />}>
          <Route index element={<h2>Dashboard</h2>} />
          <Route path="orders" element={<h2>Orders</h2>} />
          <Route path="settings" element={<h2>Settings</h2>} />
        </Route>
        {/* End of Rider routes */}
        {/* ----------------------------------------------------------------- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
