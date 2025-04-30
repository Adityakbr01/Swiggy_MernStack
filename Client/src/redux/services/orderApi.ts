import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootUrl } from "@/utils/_Constant";

console.log(RootUrl)

export const orderApi = createApi({
  reducerPath: "orderApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${RootUrl}/orders`,
    credentials: "include"
  }),

  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    // ✅ Add New Order
    createOrder: builder.mutation({
      query: (newOrder) => ({
        url: `/`,
        method: "POST",
        body: newOrder,
      }),
      invalidatesTags: ["Orders"],
    }),
    // ✅ Get All Orders
    getAllOrders: builder.query({
      query: () => ({
        url: `/paidOrders`,
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),

    Riderorders: builder.query({
      query: () => ({
        url: `/riders/orders`,
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),

    // ✅ Update Order Status
    updateOrderStatus: builder.mutation({
      query: ({ id, status,riderId }) => ({
        url: `/${id}/status`,
        method: "PUT",
        body: {status,riderId},
      }),
      invalidatesTags: ["Orders"],
    }),

    getMyOrders: builder.query({
      query: () => ({
        url: `/my-orders`,
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),

    getOrderById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),
    availableOrders: builder.query({
      query: () => ({
        url: `/availableOrders`,
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),

  }),
  
});

// ✅ Export Hooks
export const {
  useCreateOrderMutation,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useRiderordersQuery,
  useAvailableOrdersQuery
} = orderApi;
