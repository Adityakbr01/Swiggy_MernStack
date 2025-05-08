import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootUrl } from "@/utils/_Constant";

export interface FoodItem {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  vegetarian: boolean;
  restaurant: string;
  deliveryTime: number;
}

export interface Restaurant {
  _id: string;
  name: string;
  restaurantImage?: string;
  cuisines: string[];
  rating: number;
  deliveryTime: number;
  deliveryFee: number;
  location: {
    coordinates: {
      type: string;
      coordinates: [number, number];
    };
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    distance?: string;
  };
}

interface SearchFoodQueryParams {
  q: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  vegetarian: boolean;
  sortBy: string;
}

interface SearchRestaurantsQueryParams {
  q: string;
  category: string;
  sortBy: string;
}

export const restaurantApi = createApi({
  reducerPath: "restaurantApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${RootUrl}/restaurants`,
    credentials: "include",
  }),
  tagTypes: ["Restaurants"],
  endpoints: (builder) => ({
    getNearbyRestaurants: builder.query({
      query: ({ lat, lng, maxDistance = 1000 }) =>
        `/nearby?lat=${lat}&lng=${lng}&maxDistance=${maxDistance}`,
      providesTags: ["Restaurants"],
    }),
    getRestaurants: builder.query({
      query: () => "/",
      providesTags: ["Restaurants"],
    }),
    getRestaurantById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Restaurants"],
    }),
    addRestaurant: builder.mutation({
      query: (newRestaurant) => ({
        url: "/",
        method: "POST",
        body: newRestaurant,
      }),
      invalidatesTags: ["Restaurants"],
    }),
    updateRestaurant: builder.mutation<any, { restaurantId: string; data: FormData }>({
      query: ({ restaurantId, data }) => ({
        url: `/${restaurantId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Restaurants"],
    }),
    deleteRestaurant: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Restaurants"],
    }),
    addMenuItem: builder.mutation({
      query: ({ restaurantId, data }) => ({
        url: `/${restaurantId}/menu`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Restaurants"],
    }),
    getMenus: builder.query({
      query: (restaurantId) => `/${restaurantId}/menu`,
      providesTags: ["Restaurants"],
    }),
    getMenuItem: builder.query({
      query: ({ restaurantId, itemId }) => `/${restaurantId}/menu/${itemId}`,
      providesTags: ["Restaurants"],
    }),
    updateMenuItem: builder.mutation({
      query: ({ restaurantId, itemId, data }) => ({
        url: `/${restaurantId}/menu/${itemId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Restaurants"],
    }),
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
    }),
    SearchFood: builder.query<FoodItem[], SearchFoodQueryParams>({
      query: ({ q, category, minPrice, maxPrice, vegetarian, sortBy }) => ({
        url: "/search/food",
        params: {
          q,
          category,
          minPrice,
          maxPrice,
          vegetarian: vegetarian.toString(),
          sortBy,
        },
      }),
      transformResponse: (response: { status: string; results: number; data: FoodItem[] }) => response.data,
      providesTags: ["Restaurants"],
    }),
    SearchRestaurants: builder.query<Restaurant[], SearchRestaurantsQueryParams>({
      query: ({ q, category, sortBy }) => ({
        url: "/search/restaurants",
        params: {
          q,
          category,
          sortBy,
        },
      }),
      transformResponse: (response: { status: string; results: number; data: Restaurant[] }) => response.data,
      providesTags: ["Restaurants"],
    }),
  }),
});

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
  useGetSummaryQuery,
  useSearchFoodQuery,
  useSearchRestaurantsQuery,
} = restaurantApi;