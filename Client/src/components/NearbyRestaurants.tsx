import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useGetRestaurantsQuery } from "@/redux/services/restaurantApi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Define Types
interface Location {
  coordinates: { type: "Point"; coordinates: [number, number] };
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface Restaurant {
  _id: string;
  name: string;
  restaurantImage?: string;
  cuisines?: string[];
  rating: number;
  deliveryTime: number;
  isActive: boolean;
  location: Location;
}


const NearbyRestaurants: React.FC = () => {
  // const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();
  const [loading, setIsLoading] = useState(true);

  // Fetch restaurants
  const { data: nearbyRestaurants, isLoading: restaurantsLoading } = useGetRestaurantsQuery(undefined);

  useEffect(() => {
    setIsLoading(restaurantsLoading);
  }, [restaurantsLoading]);

  // Optional: Fetch user location (commented out as unused)
  /*
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => console.error("Error fetching location:", error),
      { enableHighAccuracy: true }
    );
  }, []);
  */

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <Skeleton className="h-10 w-56 bg-gray-200 rounded-md" />
            <Skeleton className="h-8 w-24 bg-gray-200 rounded-md" />
          </div>
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            navigation
            pagination={{ clickable: true }}
            className="pb-12"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <SwiperSlide key={index}>
                <div className="w-72 mx-auto">
                  <Card className="overflow-hidden border-none shadow-md bg-white rounded-2xl">
                    <Skeleton className="h-48 w-full bg-gray-200" />
                    <CardContent className="p-5 space-y-4">
                      <Skeleton className="h-6 w-3/4 bg-gray-200 rounded-md" />
                      <Skeleton className="h-4 w-full bg-gray-200 rounded-md" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-16 bg-gray-200 rounded-md" />
                        <Skeleton className="h-4 w-24 bg-gray-200 rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl font-bold font-poppins text-gray-900 tracking-tight"
          >
            Discover Nearby Restaurants
          </motion.h2>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onClick={() => navigate("/restaurants")}
            className="text-orange-600 font-semibold text-lg hover:text-orange-700 transition-colors duration-200 bg-orange-50 px-4 py-2 rounded-full hover:bg-orange-100"
            aria-label="View all restaurants"
          >
            View All
          </motion.button>
        </div>

        <div className="relative">
          {nearbyRestaurants?.data?.length ? (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              navigation
              pagination={{ clickable: true }}
              className="pb-12"
            >
              {nearbyRestaurants.data.map((restaurant: Restaurant, index: number) => (
                <SwiperSlide key={restaurant._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                    className="w-72 mx-auto py-10"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className="overflow-hidden pt-0 border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white rounded-2xl cursor-pointer"
                      onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          navigate(`/restaurant/${restaurant._id}`);
                        }
                      }}
                      aria-label={`View details for ${restaurant.name}`}
                    >
                      {/* Image Section */}
                      <div className="relative h-48 w-full group">
                        <img
                          src={restaurant.restaurantImage || "/placeholder-restaurant.jpg"}
                          alt={restaurant.name}
                          className="object-cover h-full w-full transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute h-full w-full inset-0 bg-gradient-to-b from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Badge
                          className={`absolute top-3 right-3 ${
                            restaurant.isActive ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                          } text-white font-medium px-3 py-1 rounded-full`}
                        >
                          {restaurant.isActive ? "Open" : "Closed"}
                        </Badge>
                      </div>

                      {/* Content Section */}
                      <CardContent className="p-5 space-y-3">
                        <h3 className="text-xl font-semibold font-inter text-gray-900 truncate">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-gray-600 font-inter line-clamp-1">
                          {restaurant.cuisines?.join(", ") || "Cuisine not specified"}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-sm font-medium">
                              <Star className="h-4 w-4 mr-1 fill-green-800 stroke-green-800" />
                              {restaurant.rating === 0 ? "New" : restaurant.rating.toFixed(1)}
                            </div>
                          </div>
                          <span className="text-sm text-gray-600 font-inter font-medium">
                            {restaurant.deliveryTime
                              ? `${restaurant.deliveryTime} - ${restaurant.deliveryTime + 10} min`
                              : "N/A"}
                          </span>
                          
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <p className="text-gray-600 text-lg font-inter">No restaurants found nearby.</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NearbyRestaurants;