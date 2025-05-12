
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin, PlusCircle, ImagePlus, Loader2 } from "lucide-react";
import { useAddRestaurantMutation } from "@/redux/services/restaurantApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { motion, AnimatePresence } from "framer-motion";

const AddRestaurant = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.OWN_Restaurant) {
      toast.error("You already have a restaurant!");
      navigate("/restaurant/dashboard/settings", { replace: true });
    }
  }, [user, navigate]);

  const CuisineType = {
    MAIN_COURSE: "Main Course",
    RICE_BIRYANI: "Rice & Biryani",
    ITALIAN: "Italian",
    CHINESE: "Chinese",
    MEXICAN: "Mexican",
    INDIAN: "Indian",
    FAST_FOOD: "Fast Food",
  };

  interface RestaurantState {
    name: string;
    location: {
      street: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
      coordinates: {
        type: string;
        coordinates: [number, number];
      };
    };
    deliveryTime: number;
    deliveryFee: number;
    cuisines: string[];
    restaurantImage: File | null;
  }

  const [restaurant, setRestaurant] = useState<RestaurantState>({
    name: "",
    location: {
      street: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
      coordinates: { type: "Point", coordinates: [0, 0] },
    },
    deliveryTime: 30,
    deliveryFee: 0,
    cuisines: [],
    restaurantImage: null,
  });

  const [addRestaurant, { isLoading }] = useAddRestaurantMutation();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setRestaurant((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: {
              type: "Point",
              coordinates: [position.coords.longitude, position.coords.latitude],
            },
          },
        }));
      },
      (error) => console.error("Error fetching location:", error),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRestaurant((prev) => ({
      ...prev,
      ...(name === "deliveryTime" || name === "deliveryFee"
        ? { [name]: Number(value) }
        : name in prev.location
        ? { location: { ...prev.location, [name]: value } }
        : { [name]: value }),
    }));
  };

  const handleCuisineChange = (cuisine: string) => {
    setRestaurant((prev) => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((c) => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        toast.error("Image size should be less than 2MB.");
        return;
      }
      if (file.type.startsWith("image/")) {
        setRestaurant((prev) => ({
          ...prev,
          restaurantImage: file,
        }));
      } else {
        toast.error("Invalid file type. Please upload an image.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to add a restaurant!");
      return;
    }

    const formData = new FormData();
    formData.append("name", restaurant.name);
    formData.append("deliveryTime", String(restaurant.deliveryTime));
    formData.append("deliveryFee", String(restaurant.deliveryFee));
    formData.append("location[street]", restaurant.location.street);
    formData.append("location[city]", restaurant.location.city);
    formData.append("location[state]", restaurant.location.state);
    formData.append("location[country]", restaurant.location.country);
    formData.append("location[pincode]", restaurant.location.pincode);
    formData.append("location[coordinates][type]", restaurant.location.coordinates.type);
    formData.append(
      "location[coordinates][coordinates][0]",
      String(restaurant.location.coordinates.coordinates[0])
    );
    formData.append(
      "location[coordinates][coordinates][1]",
      String(restaurant.location.coordinates.coordinates[1])
    );
    formData.append("cuisines", JSON.stringify(restaurant.cuisines));

    if (!restaurant.location.coordinates.coordinates[0] || !restaurant.location.coordinates.coordinates[1]) {
      toast.error("Please provide valid coordinates");
      return;
    }

    if (restaurant.restaurantImage) {
      formData.append("restaurantImage", restaurant.restaurantImage);
    }

    try {
      await addRestaurant(formData).unwrap();
      toast.success("Restaurant added successfully!");
      setRestaurant({
        name: "",
        location: {
          street: "",
          city: "",
          state: "",
          country: "India",
          pincode: "",
          coordinates: { type: "Point", coordinates: [0, 0] },
        },
        deliveryTime: 30,
        deliveryFee: 0,
        cuisines: [],
        restaurantImage: null,
      });
      navigate("/restaurant/dashboard/settings", { replace: true });
    } catch (err :any) {
      const errorMessage =
        err?.message || err?.error || err?.data?.message || "Failed to add restaurant. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Auth check
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <p className="text-rose-900 text-lg">Please log in to access this page.</p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen w-full bg-amber-50 p-4"
      >
        {/* Header */}
        <header className="mb-6 flex items-center justify-center">
          <h1 className="text-3xl font-bold text-rose-900 flex items-center gap-2">
            <MapPin className="w-8 h-8" /> Add Your Restaurant
          </h1>
        </header>

        {/* Main Card */}
        <Card className="w-full max-w-2xl overflow-hidden mx-auto p-0 rounded-xl shadow-lg border border-red-300 bg-rose-400/30">
          <CardHeader className="bg-rose-400/50 text-rose-900 p-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <PlusCircle className="w-6 h-6" /> Restaurant Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-amber-50">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-rose-900">Restaurant Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={restaurant.name}
                  onChange={handleChange}
                  required
                  className="rounded-lg border-red-300 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                  placeholder="Enter restaurant name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-rose-900">Street Address</Label>
                <Input
                  type="text"
                  name="street"
                  value={restaurant.location.street}
                  onChange={handleChange}
                  required
                  className="rounded-lg border-red-300 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                  placeholder="e.g., 123 Main Street"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-rose-900">City</Label>
                <Input
                  type="text"
                  name="city"
                  value={restaurant.location.city}
                  onChange={handleChange}
                  required
                  className="rounded-lg border-red-300 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                  placeholder="e.g., Mumbai"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-rose-900">State</Label>
                <Input
                  type="text"
                  name="state"
                  value={restaurant.location.state}
                  onChange={handleChange}
                  required
                  className="rounded-lg border-red-300 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                  placeholder="e.g., Maharashtra"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-rose-900">Country</Label>
                <Input
                  type="text"
                  name="country"
                  value={restaurant.location.country}
                  disabled
                  className="rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-rose-900">Pincode</Label>
                <Input
                  type="text"
                  name="pincode"
                  value={restaurant.location.pincode}
                  onChange={handleChange}
                  required
                  className="rounded-lg border-red-300 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                  placeholder="e.g., 400001"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-rose-900">Delivery Time (minutes)</Label>
                <Input
                  type="number"
                  name="deliveryTime"
                  value={restaurant.deliveryTime}
                  onChange={handleChange}
                  required
                  className="rounded-lg border-red-300 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                  placeholder="e.g., 30"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-rose-900">Delivery Fee (₹)</Label>
                <Input
                  type="number"
                  name="deliveryFee"
                  value={restaurant.deliveryFee}
                  onChange={handleChange}
                  required
                  className="rounded-lg border-red-300 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                  placeholder="e.g., 50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-rose-900">Cuisines</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(CuisineType).map((cuisine) => (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => handleCuisineChange(cuisine)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        restaurant.cuisines.includes(cuisine)
                          ? "bg-rose-500 text-white"
                          : "bg-gray-200 text-rose-900 hover:bg-rose-400/30"
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-rose-900">Restaurant Image</Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                    id="restaurantImage"
                  />
                  <label
                    htmlFor="restaurantImage"
                    className="flex items-center justify-center w-full h-12 border-2 border-dashed border-red-300 rounded-lg cursor-pointer hover:border-rose-500 transition-all bg-white"
                  >
                    {restaurant.restaurantImage ? (
                      <span className="text-rose-900">{restaurant.restaurantImage.name}</span>
                    ) : (
                      <span className="text-rose-700 flex items-center gap-2">
                        <ImagePlus className="w-5 h-5" /> Upload Image
                      </span>
                    )}
                  </label>
                </div>
                {restaurant.restaurantImage && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(restaurant.restaurantImage)}
                      alt="Restaurant Image"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-rose-400/30 border border-red-300 text-rose-900 hover:bg-rose-400/50 rounded-lg py-3 flex items-center justify-center gap-2 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" /> Add Restaurant
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddRestaurant;