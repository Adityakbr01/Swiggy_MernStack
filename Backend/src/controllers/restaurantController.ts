// @controllers/restaurantController.ts
import { json, type Request, type Response } from "express";
import type { CuisineType, IRestaurant } from "@models/restaurantModel"; // Assuming Restaurant model
import Restaurant from "@models/restaurantModel";
import { sendErrorResponse, sendSuccessResponse } from "@utils/responseUtil";
import asyncHandler from "express-async-handler";
import { deleteMediaCloudinary } from "@utils/multerConfig";
import User from "@models/userModel";
import mongoose, { Types } from "mongoose"; // 
import { deleteCache, getCache, setCache } from "@utils/redisUtils";
import { type AuthRequest } from "@middlewares/authMiddleware";

// @desc    Get nearby restaurants
// @route   GET /api/v1/restaurants/nearby
// @access  Public
export const getNearbyRestaurants = asyncHandler(async (req: Request, res: Response) => {
  // let { lat, lng, maxDistance } = req.query;

  // if (!lat || !lng) {
  //   sendErrorResponse(res, 400, "Latitude and Longitude are required");
  //   return;
  // }

  // const latitude = Number(lat);
  // const longitude = Number(lng);
  // const maxDist = Number(maxDistance) || 1000; // Default: 1000 meters

  // if (isNaN(latitude) || isNaN(longitude)) {
  //   sendErrorResponse(res, 400, "Invalid Latitude or Longitude");
  //   return;
  // }

  // const cacheKey = `nearbyRestaurants:${lat}:${lng}:${maxDist}`;

  // Try getting data from Redis cache
  // const cachedData = (await getCache(cacheKey)) as string | null;
  // if (cachedData) {
  //   sendSuccessResponse(res, 200, "Restaurants fetched successfully", JSON.parse(cachedData));
  //   return;
  // }

  // Fetch from MongoDB if not in cache
  // const restaurants = await Restaurant.find({
  //   isActive: true,
  //   "location.coordinates": {
  //     $nearSphere: {
  //       $geometry: { type: "Point", coordinates: [longitude, latitude] },
  //       $maxDistance: maxDist,
  //     },
  //   },
  // }).select("name location cuisines deliveryTime rating restaurantImage isActive");

  // Try getting data from Redis cache
  const cachedData = (await getCache("allRestaurants")) as string | null;
  if (cachedData) {
    console.log(cachedData)
    sendSuccessResponse(res, 200, "Restaurants fetched successfully", JSON.parse(cachedData));
    return;
  }

  const restaurants = await Restaurant.find({
    isActive: true
  }).select("name location cuisines deliveryTime rating restaurantImage isActive");


  if (restaurants.length === 0) {
    console.log("No restaurants found");
  } else {
    restaurants.forEach((resto:any) => {
      const [restoLng, restoLat] = resto.location.coordinates.coordinates;
      // const approxDistanceKm = Math.sqrt(
      //   Math.pow((restoLat - latitude) * 111, 2) +
      //   Math.pow((restoLng - longitude) * 100.6, 2)
      // );
      //console.log(`${resto.name} is ~${approxDistanceKm.toFixed(2)} km away`);
    });
  }

  // Store data in Redis for 6 minutes to avoid repeated DB hits
  await setCache("allRestaurants", JSON.stringify(restaurants), 360);
  sendSuccessResponse(res, 200, "Restaurants fetched successfully", restaurants);
});

// @desc    Get all restaurants
// @route   GET /api/v1/restaurants
// @access  Public
export const getRestaurants = async (req: Request, res: Response): Promise<void> => {
  const restaurants: IRestaurant[] = await Restaurant.find({ isActive: true });
  sendSuccessResponse(res, 200, "Restaurants fetched successfully", restaurants);
};

// @desc    Get restaurant by ID
// @route   GET /api/v1/restaurants/:id
// @access  Public
export const getRestaurantById = async (req: Request, res: Response): Promise<void> => {
  const restaurant: IRestaurant | null = await Restaurant.findById(req.params.id || req.body.id).populate("menu");

  if (restaurant) {
    // calculateDistance(
    //   restaurant.location.coordinates.coordinates[1],
    //   restaurant.location.coordinates.coordinates[0],
    //   req.user.location.coordinates.coordinates[1],
    //   req.user.location.coordinates.coordinates[0]
    // );
  }

  sendSuccessResponse(res, 200, "Restaurant fetched successfully", {
    restaurant,
    // distance: distance ? distance.toFixed(2) : null
  });
};

// @desc    Create restaurant
// @route   POST /api/v1/restaurants
// @access  Private
export const createRestaurant = async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user.role !== "restaurant") {
    sendErrorResponse(res, 403, "Only restaurant owners can create restaurants");
    return;
  }

  console.log(req.body);
  const { name, location, deliveryTime, cuisines, deliveryFee } = req.body;
  const restaurantImage = req.file ? req.file.path : null;
  let filePath = req.file?.path;

  if (!req.user.id && !req.user._id) {
    sendErrorResponse(res, 400, "User ID not found");
    return;
  }

  const ownerId = req.user.id || req.user._id;

  if (!name || !location || !deliveryTime || !cuisines || !deliveryFee) {
    sendErrorResponse(res, 400, "All required fields must be provided");
    if (filePath) {
      deleteMediaCloudinary(filePath);
    }
    return;
  }

  const isAlreadyCreated = await Restaurant.findOne({ ownerId });
  if (isAlreadyCreated) {
    sendErrorResponse(res, 400, "You have already created a restaurant");
    if (filePath) {
      deleteMediaCloudinary(filePath);
    }
    return;
  }

  let parsedCuisines: CuisineType[] = [];

  if (typeof cuisines === "string") {
    parsedCuisines = JSON.parse(cuisines);
  } else if (!Array.isArray(parsedCuisines)) {
    sendErrorResponse(res, 400, "Invalid cuisines format");
    if (filePath) {
      deleteMediaCloudinary(filePath);
    }
    return;
  }

  const user = await User.findById(ownerId).select("email");

  const restaurant: IRestaurant = await Restaurant.create({
    ownerId,
    name,
    location,
    isActive: true,
    cuisines: parsedCuisines,
    deliveryTime,
    deliveryFee,
    restaurantImage,
    orders: [],
    notifications: [],
    email: user?.email,
  });


  if(user) {
    user.OWN_Restaurant = restaurant._id;
    await user.save();
  }

  await restaurant.save();

  deleteCache(`user:${ownerId}`);
  deleteCache(`allRestaurants`);
  deleteCache(`nearbyRestaurants:${restaurant.location.coordinates.coordinates[1]}:${restaurant.location.coordinates.coordinates[0]}:1000`);

  sendSuccessResponse(res, 201, "Restaurant created successfully", restaurant);
};

// @desc    Update restaurant
// @route   PUT /api/v1/restaurants/:id
// @access  Private
export const updateRestaurant = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, location, isActive } = req.body;
  const restaurantImage = req.file ? req.file.path : null;

  if (!name && !location && !restaurantImage) {
    sendErrorResponse(res, 400, "At least one field (name, location, or image) is required for update");
    return;
  }

  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    sendErrorResponse(res, 404, "Restaurant not found");
    return;
  }

  if (restaurant.ownerId.toString() !== (req.user._id || req.user.id).toString()) {
    sendErrorResponse(res, 403, "Not authorized");
    return;
  }

  if (restaurantImage) {
    if (restaurant.restaurantImage) {
      await deleteMediaCloudinary(restaurant.restaurantImage);
    }
    restaurant.restaurantImage = restaurantImage;
  }

  if (name) restaurant.name = name;
  if (location) restaurant.location = location;
  if (isActive !== undefined) restaurant.isActive = isActive;

  await restaurant.save();

  deleteCache(`user:${restaurant.ownerId}`);
  deleteCache(`allRestaurants`);
  deleteCache(`nearbyRestaurants:${restaurant.location.coordinates.coordinates[1]}:${restaurant.location.coordinates.coordinates[0]}:1000`);

  sendSuccessResponse(res, 200, "Restaurant updated successfully", restaurant);
});

// @desc    Delete restaurant
// @route   DELETE /api/v1/restaurants/:id
// @access  Private
export const deleteRestaurant = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    sendErrorResponse(res, 404, "Restaurant not found");
    return;
  }

  if (restaurant.ownerId.toString() !== (req.user._id || req.user.id).toString()) {
    sendErrorResponse(res, 403, "Not authorized");
    return;
  }

  // Delete restaurant image from Cloudinary
  if (restaurant.restaurantImage) {
    await deleteMediaCloudinary(restaurant.restaurantImage);
  }

  // Delete restaurant from DB
  await Restaurant.deleteOne({ _id: req.params.id });

  const user = await User.findById(restaurant.ownerId);
  if (user) {
    user.OWN_Restaurant = null;
    await user.save();
  }

  // Clear cache
  deleteCache(`user:${restaurant.ownerId}`);
  deleteCache(`allRestaurants`);
  deleteCache(`nearbyRestaurants:${restaurant.location.coordinates.coordinates[1]}:${restaurant.location.coordinates.coordinates[0]}:1000`);

  sendSuccessResponse(res, 200, "Restaurant deleted successfully");
});

// @desc    Add menu item
// @route   POST /api/v1/restaurants/:id/menu
// @access  Private
export const addMenuItem = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const restaurant: IRestaurant | null = await Restaurant.findById(req.params.id);
  if (restaurant && restaurant.ownerId.toString() === (req.user._id || req.user.id).toString()) {
    const { itemName, price, description, category } = req.body;
    const imageUrl = req.file ? req.file.path : undefined;

    restaurant.menu.push({ itemName, price, description, category, imageUrl });
    await restaurant.save();
    const newMenuItem = restaurant.menu[restaurant.menu.length - 1];
    sendSuccessResponse(res, 200, "Menu item added successfully", newMenuItem);
  } else {
    sendErrorResponse(res, 403, "Not authorized");
  }
});

// @desc    Get all menus
// @route   GET /api/v1/restaurants/:id/menu
// @access  Public
export const getMenus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const restaurant: IRestaurant | null = await Restaurant.findById(req.params.id);
  if (restaurant) {
    sendSuccessResponse(res, 200, "Menus fetched successfully", restaurant.menu);
  } else {
    sendErrorResponse(res, 404, "Restaurant not found");
  }
});

// @desc    Get menu item
// @route   GET /api/v1/restaurants/:id/menu/:itemId
// @access  Public
export const getMenuItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const restaurant: IRestaurant | null = await Restaurant.findById(req.params.id);
  if (restaurant) {
    const menuItem = restaurant.menu.find((item:any) => item._id?.toString() === req.params.itemId);
    if (menuItem) {
      sendSuccessResponse(res, 200, "Menu item fetched successfully", menuItem);
    } else {
      sendErrorResponse(res, 404, "Menu item not found");
    }
  } else {
    sendErrorResponse(res, 404, "Restaurant not found");
  }
});

// @desc    Update menu item
// @route   PUT /api/v1/restaurants/:id/menu/:itemId
// @access  Private
export const updateMenuItem = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const restaurant: IRestaurant | null = await Restaurant.findById(req.params.id);
  if (restaurant && restaurant.ownerId.toString() === (req.user._id || req.user.id).toString()) {
    const menuItem = restaurant.menu.find((item:any) => item._id?.toString() === req.params.itemId);
    if (menuItem) {
      const filePath = req.file?.path;
      if (filePath && menuItem.imageUrl) {
        await deleteMediaCloudinary(menuItem.imageUrl);
      }
      menuItem.itemName = req.body.itemName || menuItem.itemName;
      menuItem.price = req.body.price || menuItem.price;
      menuItem.description = req.body.description || menuItem.description;
      menuItem.category = req.body.category || menuItem.category;
      if (filePath) {
        menuItem.imageUrl = filePath;
      }

      await restaurant.save();
      sendSuccessResponse(res, 200, "Menu item updated successfully", menuItem);
      deleteCache(`user:${req.user.id}`);
    } else {
      sendErrorResponse(res, 404, "Menu item not found");
    }
  } else {
    sendErrorResponse(res, 403, "Not authorized");
  }
});

// @desc    Delete menu item
// @route   DELETE /api/v1/restaurants/:id/menu/:itemId
// @access  Private
export const deleteMenuItem = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const restaurant: IRestaurant | null = await Restaurant.findById(req.params.id);
  if (restaurant && restaurant.ownerId.toString() === (req.user._id || req.user.id).toString()) {
    const menuItem = restaurant.menu.find((item:any) => item._id?.toString() === req.params.itemId);
    if (menuItem) {
      restaurant.menu = restaurant.menu.filter((item:any) => item._id?.toString() !== req.params.itemId);
      if (menuItem.imageUrl) {
        await deleteMediaCloudinary(menuItem.imageUrl);
      }
      await restaurant.save();
      sendSuccessResponse(res, 200, "Menu item deleted successfully");
      deleteCache(`user:${req.user.id}`);
    } else {
      sendErrorResponse(res, 404, "Menu item not found");
    }
  } else {
    sendErrorResponse(res, 403, "Not authorized");
  }
});