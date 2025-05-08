import { RootUrl } from "@/utils/_Constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
RootUrl

export const paymentApi = createApi({
  reducerPath: "paymentApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${RootUrl}/payments`,
    credentials: "include",

  }),

  tagTypes: ["Payments"],   
  endpoints: (builder) => ({
    // ✅ Add New Order
    createPayment: builder.mutation({
      query: ({orderId, method}) => ({
        url: `/${orderId}/payment`,
        method: "POST",
        body: {method},
      }),
      invalidatesTags: ["Payments"],
    }),
    verifyPayment: builder.mutation({
      query: ({orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature}) => ({
        url: `/verify`,
        method: "POST",
        body:{
            orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature
        }
      }),
      invalidatesTags: ["Payments"],
    }),
  }),
  
});

// ✅ Export Hooks
export const {
  useCreatePaymentMutation,
  useVerifyPaymentMutation
} = paymentApi;
