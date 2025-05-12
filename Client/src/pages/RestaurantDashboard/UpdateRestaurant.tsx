import React, { useEffect, useState } from "react";
import { useGetRestaurantByIdQuery, useUpdateRestaurantMutation } from "@/redux/services/restaurantApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useForm, SubmitHandler } from "react-hook-form";
import { Loader2, AlertCircle, Save, MapPin, ChevronLeft, Image } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Define Types
interface Coordinates {
  type: "Point";
  coordinates: [number, number];
}

interface Location {
  coordinates: Coordinates;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface Restaurant {
  _id: string;
  ownerId: string;
  name: string;
  location: Location;
  restaurantImage?: string;
  isActive: boolean;
}


interface User {
  id: string;
  OWN_Restaurant?: string;
}

interface UpdateRestaurantForm {
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  coordinates: [number, number];
  isActive: boolean;
}

const UpdateRestaurant: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };
  const navigate = useNavigate();

  // RTK Query hooks
  const { data, error, isLoading } = useGetRestaurantByIdQuery(user?.OWN_Restaurant ?? "", {
    skip: !user?.OWN_Restaurant,
  });
  const [updateRestaurant, { isLoading: isUpdating }] = useUpdateRestaurantMutation();

  // State for image handling
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateRestaurantForm>({
    defaultValues: {
      name: "",
      street: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      coordinates: [0, 0],
      isActive: false,
    },
  });

  // Fetch geolocation on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        reset((prev) => ({
          ...prev,
          coordinates: [position.coords.longitude, position.coords.latitude],
        }));
      },
      (error) => console.error("Error fetching location:", error),
      { enableHighAccuracy: true }
    );
  }, [reset]);

  // Update form with restaurant data when loaded
  useEffect(() => {
    if (data?.data) {
        const { name,restaurantImage,isActive} = data?.data?.restaurant || [];
        const {street, city, state, country, pincode,coordinates} = data?.data?.restaurant?.location || []
        console.log(street, city, state, country, pincode)
      reset({
        name,
        street,
        city,
        state,
        country,
        pincode,
        coordinates: coordinates.coordinates,
        isActive,
      });
      setImagePreview(restaurantImage || null);
    }
  }, [data, reset]);



  // Handle image selection and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // Clean up previous preview URL
      return () => URL.revokeObjectURL(previewUrl);
    }
  };

  // Form submission handler
  const onSubmit: SubmitHandler<UpdateRestaurantForm> = async (formData) => {
    if (!user?.OWN_Restaurant) {
      toast.error("No restaurant ID found");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("location[street]", formData.street);
    formDataToSend.append("location[city]", formData.city);
    formDataToSend.append("location[state]", formData.state);
    formDataToSend.append("location[country]", formData.country);
    formDataToSend.append("location[pincode]", formData.pincode);
    formDataToSend.append("location[coordinates][type]", "Point");
    formDataToSend.append("location[coordinates][coordinates][0]", formData.coordinates[0].toString());
    formDataToSend.append("location[coordinates][coordinates][1]", formData.coordinates[1].toString());
    formDataToSend.append("isActive", formData.isActive.toString());
    if (selectedImage) {
      formDataToSend.append("restaurantImage", selectedImage);
    }

    try {
      await updateRestaurant({ restaurantId: user.OWN_Restaurant, data: formDataToSend }).unwrap();
      toast.success("Restaurant updated successfully!");
      navigate("/restaurant/settings");
    } catch (err: any) {
      console.error("Update Error:", err);
      toast.error(`Failed to update restaurant: ${err?.data?.message || "Unknown error"}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-14 h-14 animate-spin text-orange-500" />
        <p className="mt-4 text-gray-700 text-lg font-medium">Loading restaurant details...</p>
      </div>
    );
  }

  // Error or no restaurant state
  if (!user?.OWN_Restaurant || error || !data?.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-orange-50 p-8 rounded-2xl shadow-lg flex flex-col items-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-orange-600" />
          <p className="text-orange-700 text-xl font-semibold">
            {error ? "Error" : "No Restaurant Found"}
          </p>
          <p className="text-gray-600 text-center">
            {error ? (error as any)?.data?.message || "An error occurred" : "You don’t have a restaurant yet."}
          </p>
          {!user?.OWN_Restaurant && (
            <Link to="/restaurants/create">
              <button className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition font-medium shadow-md">
                Create Your Restaurant
              </button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  const restaurant: Restaurant = data.data;

  return (
    
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="min-h-screen bg-gray-50 py-12 px-6"
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center space-x-3">
                <MapPin className="w-8 h-8 text-orange-500" />
                <span>Update {restaurant.name}</span>
              </h1>
              <Link to="/restaurant/dashboard/settings">
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition flex items-center space-x-2">
                  <ChevronLeft className="w-5 h-5" />
                  <span>Back to Dashboard</span>
                </button>
              </Link>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Restaurant Name
                </label>
                <input
                  id="name"
                  {...register("name", { required: "Restaurant name is required" })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  placeholder="Enter restaurant name"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Restaurant Image</label>
                <div className="flex items-center space-x-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Restaurant Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                    />
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full px-4 py-3 rounded-lg border border-dashed border-orange-500 bg-orange-50 text-orange-600 flex items-center justify-center space-x-2 hover:bg-orange-100 transition">
                      <Image className="w-5 h-5" />
                      <span>{imagePreview ? "Change Image" : "Upload Image"}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      aria-label="Upload restaurant image"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="street" className="block text-gray-700 font-medium mb-2">
                    Street
                  </label>
                  <input
                    id="street"
                    {...register("street", { required: "Street is required" })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                    placeholder="Enter street"
                    aria-invalid={!!errors.street}
                  />
                  {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>}
                </div>
                <div>
                  <label htmlFor="city" className="block text-gray-700 font-medium mb-2">
                    City
                  </label>
                  <input
                    id="city"
                    {...register("city", { required: "City is required" })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                    placeholder="Enter city"
                    aria-invalid={!!errors.city}
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label htmlFor="state" className="block text-gray-700 font-medium mb-2">
                    State
                  </label>
                  <input
                    id="state"
                    {...register("state", { required: "State is required" })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                    placeholder="Enter state"
                    aria-invalid={!!errors.state}
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label htmlFor="country" className="block text-gray-700 font-medium mb-2">
                    Country
                  </label>
                  <input
                    id="country"
                    {...register("country", { required: "Country is required" })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                    placeholder="Enter country"
                    aria-invalid={!!errors.country}
                  />
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
                </div>
                <div>
                  <label htmlFor="pincode" className="block text-gray-700 font-medium mb-2">
                    Pincode
                  </label>
                  <input
                    id="pincode"
                    {...register("pincode", {
                      required: "Pincode is required",
                      pattern: { value: /^\d{6}$/, message: "Pincode must be a 6-digit number" },
                    })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                    placeholder="Enter pincode"
                    aria-invalid={!!errors.pincode}
                  />
                  {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="longitude" className="block text-gray-700 font-medium mb-2">
                    Longitude
                  </label>
                  <input
                    id="longitude"
                    {...register("coordinates.0", {
                      required: "Longitude is required",
                      valueAsNumber: true,
                      min: { value: -180, message: "Longitude must be between -180 and 180" },
                      max: { value: 180, message: "Longitude must be between -180 and 180" },
                    })}
                    type="number"
                    step="any"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                    placeholder="Enter longitude"
                    aria-invalid={!!errors.coordinates?.[0]}
                  />
                  {errors.coordinates?.[0] && (
                    <p className="text-red-500 text-sm mt-1">{errors.coordinates[0].message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="latitude" className="block text-gray-700 font-medium mb-2">
                    Latitude
                  </label>
                  <input
                    id="latitude"
                    {...register("coordinates.1", {
                      required: "Latitude is required",
                      valueAsNumber: true,
                      min: { value: -90, message: "Latitude must be between -90 and 90" },
                      max: { value: 90, message: "Latitude must be between -90 and 90" },
                    })}
                    type="number"
                    step="any"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                    placeholder="Enter latitude"
                    aria-invalid={!!errors.coordinates?.[1]}
                  />
                  {errors.coordinates?.[1] && (
                    <p className="text-red-500 text-sm mt-1">{errors.coordinates[1].message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    {...register("isActive")}
                    type="checkbox"
                    className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-200"
                    aria-label="Restaurant Active"
                  />
                  <span className="text-gray-700 font-medium">Restaurant Active</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className={`w-full bg-orange-500 text-white py-3 rounded-full hover:bg-orange-600 transition flex items-center justify-center space-x-2 font-medium ${
                  isUpdating ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label={isUpdating ? "Updating restaurant" : "Save restaurant changes"}
              >
                {isUpdating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{isUpdating ? "Updating..." : "Save Changes"}</span>
              </button>
            </form>
          </div>
        </motion.div>
      </AnimatePresence>
    
  );
};

export default UpdateRestaurant;