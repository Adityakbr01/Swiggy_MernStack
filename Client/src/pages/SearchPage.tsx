import { useState, useCallback, Suspense, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter, X, Star, Clock, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchFoodQuery, useSearchRestaurantsQuery } from "@/redux/services/restaurantApi";

// Update categories to match backend response
const categories = [
  { id: "all", name: "All", icon: "🍽️" },
  { id: "drink", name: "Drink", icon: "🥤" },
  { id: "main course", name: "Main Course", icon: "🍛" },
  { id: "pizza", name: "Pizza", icon: "🍕" },
  { id: "rice", name: "Rice", icon: "🍚" },
  { id: "salad", name: "Salad", icon: "🥗" },
  { id: "dessert", name: "Dessert", icon: "🍰" },
  { id: "burger", name: "Burger", icon: "🍔" },
  { id: "pasta", name: "Pasta", icon: "🍝" },
];

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("restaurants");
  const [showClearButton, setShowClearButton] = useState(false);

  // Parse query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q") || "";
    setSearchQuery(query);
    setShowClearButton(!!query);
  }, [location.search]);

  // API queries
  const foodQueryParams = {
    q: searchQuery,
    category: selectedCategory === "All" ? "" : selectedCategory.toLowerCase(),
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    vegetarian: vegetarianOnly,
    sortBy,
  };

  const restaurantQueryParams = {
    q: searchQuery,
    category: selectedCategory === "All" ? "" : selectedCategory.toLowerCase(),
    sortBy,
  };

  // Debug query params
  useEffect(() => {
    console.log("Food Query Params:", foodQueryParams);
    console.log("Restaurant Query Params:", restaurantQueryParams);
  }, [foodQueryParams, restaurantQueryParams]);

  const { data: foodItems = [], isLoading: isFoodLoading, error: foodError } = useSearchFoodQuery(foodQueryParams);
  const { data: restaurants = [], isLoading: isRestaurantsLoading, error: restaurantsError } = useSearchRestaurantsQuery(restaurantQueryParams);

  // Debug API responses
  useEffect(() => {
    console.log("Food Items Response:", foodItems);
    console.log("Restaurants Response:", restaurants);
    if (foodError) console.error("Food Query Error:", foodError);
    if (restaurantsError) console.error("Restaurants Query Error:", restaurantsError);
  }, [foodItems, restaurants, foodError, restaurantsError]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("q", searchQuery);
    }
    navigate(`/search?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    navigate("/search");
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setPriceRange([0, 50]);
    setVegetarianOnly(false);
    setSortBy("relevance");
  };

  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <Suspense>
      <div className="min-h-screen flex flex-col pb-16 md:pb-0">
        <header className="sticky top-0 bg-background z-10 border-b">
          <div className="container flex items-center h-16 px-4">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="relative flex-1 max-w-md">
              <form onSubmit={handleSearch} className="w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for restaurants or dishes"
                  className="pl-8 w-full pr-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {showClearButton && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </form>
            </div>
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="ml-2">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] overflow-y-auto p-8 sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Customize your search results</SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Category</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.name ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => setSelectedCategory(category.name)}
                        >
                          <span className="mr-2">{category.icon}</span>
                          <span>{category.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Price Range</h3>
                    <div className="space-y-4">
                      <Slider
                        value={priceRange}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={setPriceRange}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">₹{priceRange[0]}</span>
                        <span className="text-sm">₹{priceRange[1]}</span>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Dietary Preferences</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vegetarian"
                        checked={vegetarianOnly}
                        onCheckedChange={(checked) => setVegetarianOnly(checked as boolean)}
                      />
                      <label
                        htmlFor="vegetarian"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Vegetarian Only
                      </label>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Sort By</h3>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sort option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="rating">Rating (High to Low)</SelectItem>
                        <SelectItem value="price-low">Price (Low to High)</SelectItem>
                        <SelectItem value="price-high">Price (High to Low)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
                  <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="flex-1 container px-4 py-6">
          <div className="mb-6 overflow-x-auto scrollbar-hide pb-2">
            <div className="flex space-x-2">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="w-full">
              <TabsTrigger value="restaurants" className="flex-1">
                Restaurants
              </TabsTrigger>
              <TabsTrigger value="dishes" className="flex-1">
                Dishes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="restaurants" className="mt-6">
              <AnimatePresence mode="wait">
                {isRestaurantsLoading ? (
                  <motion.div
                    key="restaurants-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <p className="text-muted-foreground">Loading restaurants...</p>
                  </motion.div>
                ) : restaurantsError ? (
                  <motion.div
                    key="restaurants-error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <p className="text-red-500">Error fetching restaurants: {JSON.stringify(restaurantsError)}</p>
                    <Button variant="link" onClick={resetFilters} className="mt-2">
                      Reset filters
                    </Button>
                  </motion.div>
                ) : restaurants.length > 0 ? (
                  <motion.div
                    key="restaurants-results"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {restaurants.map((restaurant) => (
                      <motion.div
                        key={restaurant._id}
                        variants={item}
                        whileHover={{ y: -5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="group cursor-pointer"
                      >
                        <div onClick={() => navigate(`/restaurant/${restaurant._id}`)} className="block">
                          <div className="overflow-hidden rounded-xl border bg-background shadow-sm transition-all hover:shadow-md">
                            <div className="relative h-48 w-full overflow-hidden">
                              <img
                                src={restaurant.restaurantImage || "https://via.placeholder.com/300"}
                                alt={restaurant.name}
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <h3 className="font-semibold text-white">{restaurant.name}</h3>
                                <p className="text-white/80 text-sm">{restaurant.cuisines.join(", ") || "N/A"}</p>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1">
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                                    {restaurant.rating || 0}
                                  </Badge>
                                </div>
                                <Badge variant="outline" className="font-normal">
                                  ₹{restaurant.deliveryFee || 0} delivery
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  <span>{restaurant.deliveryTime || 30} min</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  <span>{restaurant.location?.distance || "1 km"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-restaurants"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <p className="text-muted-foreground">No restaurants found matching your search</p>
                    <Button variant="link" onClick={resetFilters} className="mt-2">
                      Reset filters
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="dishes" className="mt-6">
              <AnimatePresence mode="wait">
                {isFoodLoading ? (
                  <motion.div
                    key="dishes-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <p className="text-muted-foreground">Loading dishes...</p>
                  </motion.div>
                ) : foodError ? (
                  <motion.div
                    key="dishes-error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <p className="text-red-500">Error fetching dishes: {JSON.stringify(foodError)}</p>
                    <Button variant="link" onClick={resetFilters} className="mt-2">
                      Reset filters
                    </Button>
                  </motion.div>
                ) : foodItems.length > 0 ? (
                  <motion.div
                    key="dishes-results"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {foodItems.map((dish) => (
                      <motion.div
                        key={dish.id}
                        variants={item}
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div onClick={() => navigate(`/dish/${dish.id}`)} className="block">
                          <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative h-48 w-full">
                              <img
                                src={dish.image || "https://via.placeholder.com/300"}
                                alt={dish.name}
                                className="object-cover w-full h-full"
                              />
                              {dish.vegetarian && (
                                <Badge className="absolute top-2 right-2 bg-green-500">Veg</Badge>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <h3 className="font-semibold text-white">{dish.name}</h3>
                                <p className="text-white/80 text-sm">{dish.restaurant}</p>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">₹{dish.price}</span>
                                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs font-medium">
                                  <Star className="h-3 w-3 fill-green-700" />
                                  {dish.rating || 0}
                                </div>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                <span>{dish.deliveryTime || 30} min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-dishes"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <p className="text-muted-foreground">No dishes found matching your search</p>
                    <Button variant="link" onClick={resetFilters} className="mt-2">
                      Reset filters
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </Suspense>
  );
};

export default SearchPage;