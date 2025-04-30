import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./services/apiSlice";
import { orderApi } from "./services/orderApi";
import authReducer from '@/redux/feature/authSlice';
import { restaurantApi } from '@/redux/services/restaurantApi';
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "./services/authApi";
import { riderApi } from "./services/riderApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [restaurantApi.reducerPath]: restaurantApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [riderApi.reducerPath]: riderApi.reducer,

    auth: authReducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware,restaurantApi.middleware,orderApi.middleware,riderApi.middleware),
});

const initialiseApp = async () => {
  try {
    const result = await store.dispatch(
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
