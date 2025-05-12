import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { RootUrl } from '@/utils/_Constant';
import { setCredentials } from '@/redux/feature/authSlice';

export interface AuthResponse {
  token: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      phone_number:string;
      profileImage: string;
      OWN_Restaurant?: string;
    };
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  role: 'USER' | 'RESTAURANT' | 'DELIVERY';
  address: string;
  profileImage?: File;
  OWN_Restaurant?: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${RootUrl}/users`,
    credentials: "include"
  }),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => {
        const formData = new FormData();
        Object.entries(credentials).forEach(([key, value]) => {
          if (value) formData.append(key, value);
        });
        
        return {
          url: '/register',
          method: 'POST',
          body: formData,
        };
      },
    }),
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          // Dispatch setCredentials with the initial login response
          dispatch(setCredentials(data as AuthResponse));

          // Fetch the user profile to get the latest user data including restaurant ID
          const profileResult = await dispatch(authApi.endpoints.getUser.initiate());
          if (profileResult.data) {
            dispatch(setCredentials(profileResult.data as AuthResponse));
          }
        } catch (error) {
          console.error("Error during login:", error);
        }
      },
      invalidatesTags: ['Profile'],
    }),
    getUser: builder.query<AuthResponse, void>({  
      query: () => ({
        url: '/profile',
        method: 'GET',
      }),
      providesTags: ['Profile'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
         
          dispatch(setCredentials(data as AuthResponse));
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      },
    }),
    updateProfile: builder.mutation<AuthResponse, FormData | { name: string; email: string; phone: string; profileImage?: File }>({
      query: (credentials) => {
        // Check if credentials is FormData
        if (credentials instanceof FormData) {
          return {
            url: '/profile',
            method: 'PUT',
            body: credentials,
          };
        }
        
        // If it's a regular object, convert to FormData
        const formData = new FormData();
        Object.entries(credentials).forEach(([key, value]) => {
          if (value) formData.append(key, value);
        });
        
        return {
          url: '/profile',
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['Profile'],
    }),
    deleteProfile: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: '/profile',
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile'],
    }),
    logout: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useUpdateProfileMutation, useDeleteProfileMutation, useGetUserQuery, useLogoutMutation } = authApi;
