// src/pages/LoginPage.tsx
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/redux/services/authApi";
import { setCredentials } from "@/redux/feature/authSlice"; // Use setCredentials
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [login] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);
      const response = await login(values).unwrap();

      if (response?.data) {
        // Prepare data for Redux and localStorage
        const authData = {
          data: {
            user: {
              id: response.data.user.id,
              name: response.data.user.name,
              email: response.data.user.email,
              role: response.data.user.role,
              phone_number: response.data.user.phone_number || "",
              profileImage: response.data.user.profileImage || "",
              OWN_Restaurant: response.data.user.OWN_Restaurant || undefined,
            },
          },
          token: response.token, // Ensure token is included
        };

        // Update Redux state
        dispatch(setCredentials(authData));

        // Store in localStorage for useUser compatibility
        localStorage.setItem("Food-App-user", JSON.stringify(authData.data.user));

        toast.success("Login successful!");
        // Let AuthGuard handle navigation
        navigate("/auth/Login", { replace: true }); // Trigger AuthGuard redirect
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left side - Image and branding */}
      <div className="hidden md:flex md:w-1/2 h-screen bg-orange-50 flex-col items-center justify-center p-8 relative">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-orange-500 mb-2">Food App</h1>
            <p className="text-gray-600 text-lg">Delicious food, delivered fast.</p>
          </div>

          <div className="relative h-80 w-full mb-8">
            <img
              src="https://images.unsplash.com/photo-1669030902705-b8aae15adf9d?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Food"
              className="absolute inset-0 object-cover h-full w-full rounded-xl"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700">Order from a wide selection of restaurants</p>
            </div>
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700">Track your order in real-time</p>
            </div>
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700">Fast and reliable delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 h-screen overflow-y-auto p-4 md:p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-1">Login to continue your food journey</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full cursor-pointer h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md mt-6"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </Button>

              <div className="text-center mt-4">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{" "}
                  <Link to="/auth/Register" className="text-orange-500 hover:text-orange-600 font-medium">
                    Register
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;