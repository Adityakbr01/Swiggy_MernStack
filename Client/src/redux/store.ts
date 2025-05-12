import authReducer from '@/redux/feature/authSlice';
import cartReducer from '@/redux/feature/cartSlice';
import { restaurantApi } from '@/redux/services/restaurantApi';
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "./services/authApi";
import { orderApi } from "./services/orderApi";
import { paymentApi } from "./services/paymentApi";
import { riderApi } from "./services/riderApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [restaurantApi.reducerPath]: restaurantApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [riderApi.reducerPath]: riderApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    
    cart: cartReducer,
    auth: authReducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware,restaurantApi.middleware,orderApi.middleware,riderApi.middleware,paymentApi.middleware),
});

const initialiseApp = async () => {
  try {
  await store.dispatch(
      authApi.endpoints.getUser.initiate()
    ).unwrap();
  } catch (error) {
    console.error('Failed to initialise app:', error);
  }
}

initialiseApp();

setupListeners(store.dispatch);

// type support ke liye
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
