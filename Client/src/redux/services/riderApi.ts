import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/redux/store";
import { RootUrl } from "@/utils/_Constant";
import { use } from "react";

interface RiderOrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: Array<{
      _id: string;
      restaurantName: string;
      restaurantAddress: string;
      customerName: string;
      customerPhone: string;
      totalAmount: number;
      deliveryFee: number;
      status: string;
      createdAt: string;
      deliveryAddress: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const riderApi = createApi({
  reducerPath: "riderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${RootUrl}/riders`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getRiderSummary: builder.query<any, void>({ query: () => "/dashboard" }),
    updateOrderStatus: builder.mutation<
      void,
      { orderId: string; status: string }
    >({
      query: ({ orderId, status }) => ({
        url: `/order/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
    }),
    updateAvailability: builder.mutation<void, { availability: boolean }>({
      query: (body) => ({
        url: "/availability",
        method: "PATCH",
        body,
      }),
    }),
    getAllOrdersForRider: builder.query<
      RiderOrdersResponse,
      { page: number; limit: number }
    >({
      query: ({ page, limit }) => `/orders?page=${page}&limit=${limit}`,
    }),
    // Accept an order (rider)
    acceptOrder: builder.mutation<
      ApiResponse<{ orderId: string; status: string }>,
      { orderId: string }
    >({
      query: ({ orderId }) => ({
        url: `/orders/${orderId}/accept`,
        method: "POST",
      }),
    }),
      // Get available riders (restaurant/admin)
      getAvailableRiders: builder.query<ApiResponse<any[]>, void>({
        query: () => ({
          url: "/available",
          method: "GET",
        }),
      }),
      // availableOrders: builder.query({
      //   query: () => ({
      //     url: `/availableOrders`,
      //     method: "GET",
      //   })
      // }),
      AllordersForRider: builder.query({
        query: () => ({
          url: `/Allorders`,
          method: "GET",
        })
      }),
      availableorders: builder.query({
        query: () => ({
          url: `/available-orders`,
          method: "GET",
        })
      })
  }),
});

export const {
  useGetRiderSummaryQuery,
  useUpdateOrderStatusMutation,
  useUpdateAvailabilityMutation,
  useGetAllOrdersForRiderQuery,
  useAcceptOrderMutation,
  useGetAvailableRidersQuery,
  useAllordersForRiderQuery,
useAvailableordersQuery
} = riderApi;
