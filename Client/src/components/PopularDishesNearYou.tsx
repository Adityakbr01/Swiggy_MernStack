import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useGetRestaurantsQuery } from "@/redux/services/restaurantApi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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


const PopularDishesNearYou: React.FC = () => {
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
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-9 w-48 bg-gray-200" />
            <Skeleton className="h-6 w-20 bg-gray-200" />
          </div>
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            navigation
            pagination={{ clickable: true }}
            className="pb-10"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <SwiperSlide key={index}>
                <div className="w-80 mx-auto">
                  <Card className="overflow-hidden border-none shadow-lg bg-white rounded-xl">
                    <Skeleton className="h-52 w-full bg-gray-200" />
                    <CardContent className="p-5 space-y-3">
                      <Skeleton className="h-5 w-3/4 bg-gray-200" />
                      <Skeleton className="h-4 w-full bg-gray-200" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-12 bg-gray-200" />
                        <Skeleton className="h-4 w-20 bg-gray-200" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full bg-gray-200 rounded-full" />
                    </CardFooter>
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
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-extrabold font-sans text-gray-900 tracking-tight"
          >
            Popular Dishes Near You
          </motion.h2>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate("/search")}
            className="text-orange-600 font-semibold hover:text-orange-700 transition-colors duration-200"
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
              }}
              navigation
              pagination={{ clickable: true }}
              className="pb-10"
            >
              {nearbyRestaurants.data.map((restaurant: Restaurant) => (
                <SwiperSlide key={restaurant._id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-80 mx-auto py-10"
                  >
                    <Card
                      className="overflow-hidden pt-0 border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-xl cursor-pointer"
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
                      <div className="relative h-52 w-full group">
                        <img
                          src={restaurant.restaurantImage || "/placeholder-restaurant.jpg"}
                          alt={restaurant.name}
                          className="object-cover h-full w-full transition-transform duration-300 group-hover:scale-105"
                        />
                        <Badge
                          className={`absolute top-3 right-3 ${
                            restaurant.isActive ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                          } text-white font-medium px-2.5 py-1`}
                        >
                          {restaurant.isActive ? "Open" : "Closed"}
                        </Badge>
                      </div>

                      {/* Content Section */}
                      <CardContent className="p-5 space-y-3">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{restaurant.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {restaurant.cuisines?.join(", ") || "Cuisine not specified"}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-1">
                            <div className="flex items-center bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                              <Star className="h-3.5 w-3.5 mr-1 fill-green-800 stroke-green-800" />
                              {restaurant.rating === 0 ? "New" : restaurant.rating.toFixed(1)}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500 font-medium">
                            {restaurant.deliveryTime
                              ? `${restaurant.deliveryTime} - ${restaurant.deliveryTime + 10} min`
                              : "N/A"}
                          </span>
                        </div>
                      </CardContent>

                      {/* Footer Section */}
                      <CardFooter className="pt-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full rounded-full border border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/restaurant/${restaurant._id}`);
                          }}
                          aria-label={`Order from ${restaurant.name}`}
                        >
                          Order
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8"
            >
              <p className="text-gray-600 text-lg">No popular dishes found nearby.</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularDishesNearYou;