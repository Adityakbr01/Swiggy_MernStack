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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegisterMutation } from "@/redux/services/authApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone_number: z.string().superRefine((val, ctx) => {
    const role = ctx.path[0] === "role" ? ctx.path[1] : undefined;
    if (role === "restaurant" || role === "rider") {
      if (!val) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Phone number is required for restaurant and rider roles",
        });
        return false;
      }
      if (!/^\d{10}$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Phone number must be exactly 10 digits",
        });
        return false;
      }
    }
    return true;
  }),
  role: z.enum(["admin", "customer", "restaurant", "rider"]),
  address: z
    .array(
      z.object({
        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        country: z.string().min(1, "Country is required"),
        pincode: z
          .string()
          .length(6, "Pincode must be exactly 6 digits")
          .regex(/^\d+$/, "Pincode must be numeric"),
        location: z.object({
          type: z.literal("Point"),
          coordinates: z.tuple([
            z.number().min(-180).max(180),
            z.number().min(-90).max(90),
          ]),
        }),
      })
    )
    .min(1, "At least one address is required"),
  profileImage: z.any().optional(),
});

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [register] = useRegisterMutation();
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone_number: "",
      role: "customer",
      address: [
        {
          street: "",
          city: "",
          state: "",
          country: "India",
          pincode: "",
          location: {
            type: "Point",
            coordinates: [0, 0],
          },
        },
      ],
    },
  });

  const getLocation = async (
    index: number,
    onChange: (value: any) => void,
    value: any
  ) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLocationPermissionDenied(true);
      return false;
    }

    setLocationLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      });

      const newAddress = [...value];
      newAddress[index].location.coordinates = [
        position.coords.longitude,
        position.coords.latitude,
      ];
      onChange(newAddress);
      setLocationPermissionDenied(false);
      return true;
    } catch (error) {
      if (error.code === 1) {
        toast.error(
          "Location access denied. Please enable location access in your browser settings."
        );
        setLocationPermissionDenied(true);
      } else if (error.code === 2) {
        toast.error("Location unavailable. Please try again.");
      } else if (error.code === 3) {
        toast.error("Location request timed out. Please try again.");
      } else {
        toast.error("Failed to get location. Please try again.");
      }
      return false;
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    const formValues = form.getValues();
    getLocation(
      0,
      (newValue: any) => {
        form.setValue("address", newValue, {
          shouldValidate: true,
          shouldDirty: true,
        });
      },
      formValues.address
    );
  }, [form]);

  const onSubmit = async (values: any) => {
    // Check location permission for restaurant and rider roles
    if (values.role === "restaurant" || values.role === "rider") {
      const hasValidCoordinates = values.address.every((addr: any) =>
        addr?.location?.coordinates?.some((coord: any) => coord !== 0)
      );

      if (!hasValidCoordinates) {
        toast.error(
          "Location is required for registration. Please allow location access and try again."
        );
        return;
      }

      const locationGranted = await getLocation(
        0,
        (newValue: any) => {
          form.setValue("address", newValue, {
            shouldValidate: true,
            shouldDirty: true,
          });
        },
        values.address
      );

      if (!locationGranted) {
        toast.error(
          "Location access is required for registration. Please enable location access and try again."
        );
        return;
      }
    }

    try {
      setLoading(true);
      const roleMap = {
        customer: "customer",
        restaurant: "restaurant",
        rider: "rider",
      };

      const formData = {
        ...values,
        role: roleMap[values.role],
        address: JSON.stringify(values.address),
      };

      const response = await register(formData).unwrap();
      if (response?.data) {
        localStorage.setItem(
          "Food-App-user",
          JSON.stringify({
            fullName: response.data.user.name,
            email: response.data.user.email,
            isAuthenticated: true,
            role: response.data.user.role,
          })
        );
      }
      toast.success("Registration successful!");
      navigate("/auth/Login");
    } catch (error) {
      if (error?.data?.errors) {
        error.data.errors.forEach((err: any) => {
          if (err.path) {
            form.setError(err.path, {
              type: "server",
              message: err.msg,
            });
          } else {
            toast.error(err.msg);
          }
        });
      } else {
        toast.error(error?.data?.message || "Registration failed");
      }
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
            <h1 className="text-4xl font-bold text-orange-500 mb-2">
              Food App
            </h1>
            <p className="text-gray-600 text-lg">
              Delicious food, delivered fast.
            </p>
          </div>

          <div className="relative h-80 w-full mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1669030902705-b8aae15adf9d?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Food"
                className="absolute inset-0 object-cover h-full w-full"
              />
            </div>
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-700">
                Order from a wide selection of restaurants
              </p>
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-700">Fast and reliable delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Registration form */}
      <div className="w-full md:w-1/2 h-screen overflow-y-auto p-4 md:p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 mt-1">
              Join us and start ordering your favorite food
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
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

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">I want to</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md">
                        <SelectItem
                          value="customer"
                          className="py-2.5 hover:bg-orange-50"
                        >
                          Order food
                        </SelectItem>
                        <SelectItem
                          value="restaurant"
                          className="py-2.5 hover:bg-orange-50"
                        >
                          Partner as a restaurant
                        </SelectItem>
                        <SelectItem
                          value="rider"
                          className="py-2.5 hover:bg-orange-50"
                        >
                          Deliver food
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      Phone Number{" "}
                      {form.watch("role") !== "customer" && "(Required)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="10-digit mobile number"
                        {...field}
                        required={form.watch("role") !== "customer"}
                        className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
                <h3 className="font-medium text-gray-700 mb-3">
                  Delivery Address
                </h3>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      {value.map((address, index) => (
                        <div key={index} className="space-y-3">
                          <FormControl>
                            <Input
                              placeholder="Street / House / Flat No."
                              value={address.street}
                              onChange={(e) => {
                                const newAddress = [...value];
                                newAddress[index].street = e.target.value;
                                onChange(newAddress);
                              }}
                              className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md"
                            />
                          </FormControl>

                          <div className="grid grid-cols-2 gap-3">
                            <FormControl>
                              <Input
                                placeholder="City"
                                value={address.city}
                                onChange={(e) => {
                                  const newAddress = [...value];
                                  newAddress[index].city = e.target.value;
                                  onChange(newAddress);
                                }}
                                className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md"
                              />
                            </FormControl>
                            <FormControl>
                              <Input
                                placeholder="State"
                                value={address.state}
                                onChange={(e) => {
                                  const newAddress = [...value];
                                  newAddress[index].state = e.target.value;
                                  onChange(newAddress);
                                }}
                                className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md"
                              />
                            </FormControl>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <FormControl>
                              <Input
                                placeholder="Country"
                                value={address.country}
                                onChange={(e) => {
                                  const newAddress = [...value];
                                  newAddress[index].country = e.target.value;
                                  onChange(newAddress);
                                }}
                                className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md"
                              />
                            </FormControl>
                            <FormControl>
                              <Input
                                placeholder="Pincode"
                                value={address.pincode}
                                onChange={(e) => {
                                  const newAddress = [...value];
                                  newAddress[index].pincode = e.target.value;
                                  onChange(newAddress);
                                }}
                                className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md"
                              />
                            </FormControl>
                          </div>

                          <div className="mt-2">
                            {locationPermissionDenied && (
                              <Button
                                type="button"
                                onClick={() =>
                                  getLocation(index, onChange, value)
                                }
                                className="w-full bg-orange-100 text-orange-600 hover:bg-orange-200 border border-orange-200 h-12 rounded-md"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                Use Current Location
                              </Button>
                            )}
                            <FormControl>
                              <div className="mt-2">
                                {locationLoading ? (
                                  <div className="text-sm text-orange-500 flex items-center">
                                    <svg
                                      className="animate-spin h-4 w-4 mr-2"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    Getting your location...
                                  </div>
                                ) : address.location.coordinates[0] !== 0 &&
                                  address.location.coordinates[1] !== 0 ? (
                                  <div className="text-sm text-green-600 flex items-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 mr-2"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    Location detected:{" "}
                                    {address.location.coordinates[1].toFixed(4)}
                                    °N,{" "}
                                    {address.location.coordinates[0].toFixed(4)}
                                    °E
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500 flex items-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 mr-2"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                      />
                                    </svg>
                                    {locationPermissionDenied ? (
                                      <span className="text-red-500">
                                        Location access denied. Please allow
                                        location access.
                                      </span>
                                    ) : (
                                      "Unable to get location. Please allow location access."
                                    )}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                          </div>
                        </div>
                      ))}
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="profileImage"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="text-gray-700">
                      Profile Image (Optional)
                    </FormLabel>
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {imagePreview ? (
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-300">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setImagePreview(reader.result as any);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                            id="profile-upload"
                            {...field}
                          />
                          <label
                            htmlFor="profile-upload"
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            Choose image
                          </label>
                        </div>
                      </FormControl>
                    </div>
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
                    Registering...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="text-center mt-4">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/auth/Login"
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Log in
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

export default RegisterPage;
