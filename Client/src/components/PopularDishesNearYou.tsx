// src/components/NearbyRestaurants.tsx
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useGetNearbyRestaurantsQuery, useGetRestaurantsQuery } from "@/redux/services/restaurantApi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";

export default function PopularDishesNearYou() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();
  const [loading, setIsLoading] = useState(true);

  const location = userLocation;
  const { data: nearbyRestaurants, isLoading: restaurantsLoading } = useGetRestaurantsQuery(undefined);

  useEffect(() => {
    setIsLoading(restaurantsLoading);
  }, [restaurantsLoading]);

  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-9 w-48 bg-gray-200" />
            <Skeleton className="h-6 w-20 bg-gray-200" />
          </div>
          <div className="flex overflow-x-hidden pb-6 space-x-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex-none w-80">
                <Card className="overflow-hidden border-none shadow-lg bg-white rounded-xl">
                  <Skeleton className="h-48 w-full bg-gray-200" />
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4 bg-gray-200" />
                    <Skeleton className="h-4 w-full bg-gray-200" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-12 bg-gray-200" />
                      <Skeleton className="h-4 w-20 bg-gray-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-extrabold font-Lato lato-black-italic text-gray-900 tracking-tight"
          >
            Popular Dishes Near You
          </motion.h2>
          <button
            onClick={() => navigate("/restaurants")}
            className="text-orange-600 font-semibold hover:text-orange-700 transition-colors duration-200"
          >
            View All
          </button>
        </div>

        <div className="relative">
          {nearbyRestaurants?.data?.length && (
            <div className="flex overflow-x-auto  pb-6 space-x-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {nearbyRestaurants.data.map((restaurant: any) => (
                <motion.div
                  key={restaurant._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex-none w-80"
                >
                  <Card
                    className="overflow-hidden  p-0 border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-xl cursor-pointer"
                    onClick={() => navigate(`/restaurant/${restaurant._id}`)}
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
                    <CardContent className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{restaurant.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2">
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
                          {restaurant.deliveryTime + " - " + (restaurant.deliveryTime + 10) + " min" || "N/A"}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                      variant={"ghost"}
                        size="sm"
                        className="w-full rounded-full cursor-pointer mb-6 border hover:bg-orange-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/restaurant/${restaurant._id}`);
                        }}
                      >
                        Order
                      </Button>
                        
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
