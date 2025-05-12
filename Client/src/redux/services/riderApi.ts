import { RootUrl } from "@/utils/_Constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Interfaces
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
    status: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Create API
export const riderApi = createApi({
  reducerPath: "riderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${RootUrl}/riders`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // Rider dashboard summary
    getRiderSummary: builder.query<any, { isDelivered: boolean }>({
      query: ({ isDelivered }) => {
        const params = new URLSearchParams();
        params.set("isDelivered", isDelivered.toString());
        return `/dashboard?${params.toString()}`;
      },
    }),

    // Update order status
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

    // Update rider availability
    updateAvailability: builder.mutation<void, { availability: boolean }>({
      query: (body) => ({
        url: "/availability",
        method: "PATCH",
        body,
      }),
    }),

    // ✅ Enhanced getAllOrdersForRider with filters and pagination
    getAllOrdersForRider: builder.query<
      RiderOrdersResponse,
      { page: number; limit: number; status?: string; dateFrom?: string; dateTo?: string }
    >({
      query: ({ page, limit, status, dateFrom, dateTo }) => {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", limit.toString());
        if (status) params.set("status", status);
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);
        return `/Allorders?${params.toString()}`;
      },
    }),

    // Accept an order
    acceptOrder: builder.mutation<
      ApiResponse<{ orderId: string; status: string }>,
      { orderId: string }
    >({
      query: ({ orderId }) => ({
        url: `/orders/${orderId}/accept`,
        method: "POST",
      }),
    }),

    // Get available riders
    getAvailableRiders: builder.query<ApiResponse<any[]>, void>({
      query: () => ({
        url: "/available",
        method: "GET",
      }),
    }),

    // All orders for a rider
    AllordersForRiderOnly: builder.query({
      query: () => ({
        url: `/Allorders`,
        method: "GET",
      }),
    }),

    // Available orders (unassigned)
    availableorders: builder.query({
      query: () => ({
        url: `/available-orders`,
        method: "GET",
      }),
    }),
  }),
});

// Hooks
export const {
  useGetRiderSummaryQuery,
  useUpdateOrderStatusMutation,
  useUpdateAvailabilityMutation,
  useGetAllOrdersForRiderQuery,
  useAcceptOrderMutation,
  useGetAvailableRidersQuery,
  useAllordersForRiderOnlyQuery,
  useAvailableordersQuery,
} = riderApi;
