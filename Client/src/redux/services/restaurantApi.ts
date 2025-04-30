import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootUrl } from "@/utils/_Constant";

export const restaurantApi = createApi({
  reducerPath: "restaurantApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${RootUrl}/restaurants`,
    credentials: "include"
  }),

  
  tagTypes: ["Restaurants"],
  endpoints: (builder) => ({
    // ✅ Get Nearby Restaurants
    getNearbyRestaurants: builder.query({
      query: ({ lat, lng, maxDistance = 1000 }) =>
        `/nearby?lat=${lat}&lng=${lng}&maxDistance=${maxDistance}`,
      providesTags: ["Restaurants"],
    }),

    // ✅ Get All Restaurants
    getRestaurants: builder.query({
      query: () => "/",
      providesTags: ["Restaurants"],
    }),

    // ✅ Get Single Restaurant by ID
    getRestaurantById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Restaurants"],
    }),

    // ✅ Add New Restaurant
    addRestaurant: builder.mutation({
      query: (newRestaurant) => ({
        url: "/",
        method: "POST",
        body: newRestaurant,
      }),
      invalidatesTags: ["Restaurants"],
    }),

    // ✅ Update Restaurant
    updateRestaurant: builder.mutation<any, { restaurantId: string; data: FormData }>({
      query: ({ restaurantId, data }) => ({
        url: `/${restaurantId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Restaurants"],
    }),

    // ✅ Delete Restaurant
    deleteRestaurant: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Restaurants"],
    }),

    // ✅ Add New Menu Item
    addMenuItem: builder.mutation({
      query: ({ restaurantId, data }) => ({
        url: `/${restaurantId}/menu`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Restaurants"],
    }),

    // ✅ Get Menus by Restaurant ID
    getMenus: builder.query({
      query: (restaurantId) => `/${restaurantId}/menu`,
      providesTags: ["Restaurants"],
    }),

    // ✅ Get Menu Items by Restaurant ID
    getMenuItem: builder.query({
      query: ({ restaurantId, itemId }) => `/${restaurantId}/menu/${itemId}`,
      providesTags: ["Restaurants"],
    }),

    // ✅ Update Menu Item
    updateMenuItem: builder.mutation({
      query: ({ restaurantId, itemId, data }) => ({
        url: `/${restaurantId}/menu/${itemId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Restaurants"],
    }),


    // ✅ Delete Menu Item
    deleteMenuItem: builder.mutation({
      query: ({ restaurantId, itemId }) => ({
        url: `/${restaurantId}/menu/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Restaurants"],
    }),

    getAllMyMenus: builder.query({
      query: () => `/menus`,
      providesTags: ["Restaurants"],
    }),
    GetSummary: builder.query({
      query: () => `/dashboard/summary`,
      providesTags: ["Restaurants"],
    })
  }),
  
});

// ✅ Export Hooks
export const {
  useGetNearbyRestaurantsQuery,
  useGetRestaurantsQuery,
  useGetRestaurantByIdQuery,
  useAddRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useAddMenuItemMutation,
  useGetMenusQuery,
  useGetMenuItemQuery,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useGetAllMyMenusQuery,
  useGetSummaryQuery

} = restaurantApi;
