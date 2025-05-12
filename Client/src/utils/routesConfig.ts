// src/routesConfig.ts

export const ROUTES = {
    HOME: "/",
    RESTAURANT: "/restaurant/:id",
    CART: "/cart",
    ORDERS: "/orders",
    ORDER_TRACK: "/orders/:id",
    SEARCH: "/search",
    LOGIN: "/auth/Login",
    REGISTER: "/auth/Register",
    DASHBOARD: "/dashboard",
  };
  
  export const CUSTOMER_ROUTES = [
    ROUTES.HOME,
    ROUTES.RESTAURANT,
    ROUTES.CART,
    ROUTES.ORDERS,
    ROUTES.ORDER_TRACK,
    ROUTES.SEARCH,
  ];
  
  export const RESTRICTED_ROLES_FOR_CUSTOMER_ROUTES = ["rider", "restaurant"];
  