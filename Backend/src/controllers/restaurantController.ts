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
import Order from "@/models/orderModel";
import {format} from "date-fns";

// @desc    Get nearby restaurants
// @route   GET /api/v1/restaurants/nearby
// @access  Public
export const getNearbyRestaurants = asyncHandler(
  async (req: Request, res: Response) => {
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
      console.log(cachedData);
      sendSuccessResponse(
        res,
        200,
        "Restaurants fetched successfully",
        JSON.parse(cachedData)
      );
      return;
    }

    const restaurants = await Restaurant.find({
      isActive: true,
    }).select(
      "name location cuisines deliveryTime rating restaurantImage isActive"
    );

    if (restaurants.length === 0) {
      console.log("No restaurants found");
    } else {
      restaurants.forEach((resto: any) => {
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
    sendSuccessResponse(
      res,
      200,
      "Restaurants fetched successfully",
      restaurants
    );
  }
);

// @desc    Get all restaurants
// @route   GET /api/v1/restaurants
// @access  Public
export const getRestaurants = async (
  req: Request,
  res: Response
): Promise<void> => {
  const restaurants: IRestaurant[] = await Restaurant.find({ isActive: true });
  sendSuccessResponse(
    res,
    200,
    "Restaurants fetched successfully",
    restaurants
  );
};

// @desc    Get restaurant by ID
// @route   GET /api/v1/restaurants/:id
// @access  Public
export const getRestaurantById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const restaurant: IRestaurant | null = await Restaurant.findById(
    req.params.id || req.body.id
  ).populate("menu");

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
export const createRestaurant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (req.user.role !== "restaurant") {
    sendErrorResponse(
      res,
      403,
      "Only restaurant owners can create restaurants"
    );
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

  if (user) {
    user.OWN_Restaurant = restaurant._id;
    await user.save();
  }

  await restaurant.save();

  deleteCache(`user:${ownerId}`);
  deleteCache(`allRestaurants`);
  deleteCache(
    `nearbyRestaurants:${restaurant.location.coordinates.coordinates[1]}:${restaurant.location.coordinates.coordinates[0]}:1000`
  );

  sendSuccessResponse(res, 201, "Restaurant created successfully", restaurant);
};

// @desc    Update restaurant
// @route   PUT /api/v1/restaurants/:id
// @access  Private
export const updateRestaurant = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, location, isActive } = req.body;
    const restaurantImage = req.file ? req.file.path : null;

    if (!name && !location && !restaurantImage) {
      sendErrorResponse(
        res,
        400,
        "At least one field (name, location, or image) is required for update"
      );
      return;
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      sendErrorResponse(res, 404, "Restaurant not found");
      return;
    }

    if (
      restaurant.ownerId.toString() !== (req.user._id || req.user.id).toString()
    ) {
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
    deleteCache(
      `nearbyRestaurants:${restaurant.location.coordinates.coordinates[1]}:${restaurant.location.coordinates.coordinates[0]}:1000`
    );

    sendSuccessResponse(
      res,
      200,
      "Restaurant updated successfully",
      restaurant
    );
  }
);

// @desc    Delete restaurant
// @route   DELETE /api/v1/restaurants/:id
// @access  Private
export const deleteRestaurant = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      sendErrorResponse(res, 404, "Restaurant not found");
      return;
    }

    if (
      restaurant.ownerId.toString() !== (req.user._id || req.user.id).toString()
    ) {
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
    deleteCache(
      `nearbyRestaurants:${restaurant.location.coordinates.coordinates[1]}:${restaurant.location.coordinates.coordinates[0]}:1000`
    );

    sendSuccessResponse(res, 200, "Restaurant deleted successfully");
  }
);

// @desc    Add menu item
// @route   POST /api/v1/restaurants/:id/menu
// @access  Private
export const addMenuItem = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const restaurant: IRestaurant | null = await Restaurant.findById(
      req.params.id
    );
    if (
      restaurant &&
      restaurant.ownerId.toString() === (req.user._id || req.user.id).toString()
    ) {
      const { itemName, price, description, category } = req.body;
      const imageUrl = req.file ? req.file.path : undefined;

      restaurant.menu.push({
        itemName,
        price,
        description,
        category,
        imageUrl,
      });
      await restaurant.save();
      const newMenuItem = restaurant.menu[restaurant.menu.length - 1];
      sendSuccessResponse(
        res,
        200,
        "Menu item added successfully",
        newMenuItem
      );
    } else {
      sendErrorResponse(res, 403, "Not authorized");
    }
  }
);

// @desc    Get all menus
// @route   GET /api/v1/restaurants/:id/menu
// @access  Public
export const getMenus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const restaurant: IRestaurant | null = await Restaurant.findById(
      req.params.id
    );
    if (restaurant) {
      sendSuccessResponse(
        res,
        200,
        "Menus fetched successfully",
        restaurant.menu
      );
    } else {
      sendErrorResponse(res, 404, "Restaurant not found");
    }
  }
);

// @desc    Get menu item
// @route   GET /api/v1/restaurants/:id/menu/:itemId
// @access  Public
export const getMenuItem = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const restaurant: IRestaurant | null = await Restaurant.findById(
      req.params.id
    );
    if (restaurant) {
      const menuItem = restaurant.menu.find(
        (item: any) => item._id?.toString() === req.params.itemId
      );
      if (menuItem) {
        sendSuccessResponse(
          res,
          200,
          "Menu item fetched successfully",
          menuItem
        );
      } else {
        sendErrorResponse(res, 404, "Menu item not found");
      }
    } else {
      sendErrorResponse(res, 404, "Restaurant not found");
    }
  }
);

// @desc    Update menu item
// @route   PUT /api/v1/restaurants/:id/menu/:itemId
// @access  Private
export const updateMenuItem = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const restaurant: IRestaurant | null = await Restaurant.findById(
      req.params.id
    );
    if (
      restaurant &&
      restaurant.ownerId.toString() === (req.user._id || req.user.id).toString()
    ) {
      const menuItem = restaurant.menu.find(
        (item: any) => item._id?.toString() === req.params.itemId
      );
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
        sendSuccessResponse(
          res,
          200,
          "Menu item updated successfully",
          menuItem
        );
        deleteCache(`user:${req.user.id}`);
      } else {
        sendErrorResponse(res, 404, "Menu item not found");
      }
    } else {
      sendErrorResponse(res, 403, "Not authorized");
    }
  }
);

// @desc    Delete menu item
// @route   DELETE /api/v1/restaurants/:id/menu/:itemId
// @access  Private
export const deleteMenuItem = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const restaurant: IRestaurant | null = await Restaurant.findById(
      req.params.id
    );
    if (
      restaurant &&
      restaurant.ownerId.toString() === (req.user._id || req.user.id).toString()
    ) {
      const menuItem = restaurant.menu.find(
        (item: any) => item._id?.toString() === req.params.itemId
      );
      if (menuItem) {
        restaurant.menu = restaurant.menu.filter(
          (item: any) => item._id?.toString() !== req.params.itemId
        );
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
  }
);

export const getAllMenus = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await User.findById(req.user.id);
    if (!user) {
      sendErrorResponse(res, 404, "User not found");
      return;
    }

    const restaurant = await Restaurant.findById(user.OWN_Restaurant).select("menu");

    if (!restaurant) {
      sendErrorResponse(res, 404, "Restaurant not found");
      return;
    }

    sendSuccessResponse(res, 200, "Menus fetched successfully", restaurant.menu);
  }
);


// Dashboard summary response interface
interface DashboardSummary {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeOrders: number;
  averageOrderValue: number;
  uniqueCustomers: number;
  recentOrders: Array<{
    _id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: Array<{
      itemName: string;
      quantity: number;
      price: number;
    }>;
  }>;
}



// Dashboard summary response interface
interface DashboardSummary {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeOrders: number;
  averageOrderValue: number;
  uniqueCustomers: number;
  restaurantName: string;
  popularDishes: Array<{
    itemName: string;
    itemId: string;
    orderCount: number;
  }>;
  revenueTrend: Array<{
    day: string;
    revenue: number;
  }>;
  recentOrders: Array<{
    _id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: Array<{
      itemName: string;
      quantity: number;
      price: number;
    }>;
  }>;
}

// Controller to fetch restaurant dashboard summary
export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is authenticated and has restaurant role
    if (!req.user || req.user.role !== "restaurant") {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in as a restaurant",
      });
      return;
    }

    // Fetch user and validate
    const user = await User.findById(req.user.id).select("OWN_Restaurant").lean();
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (!user.OWN_Restaurant) {
      res.status(400).json({
        success: false,
        message: "No restaurant associated with this user",
      });
      return;
    }

    const restaurantId = new Types.ObjectId(user.OWN_Restaurant);

    // Fetch restaurant for name and menu
    const restaurant = await Restaurant.findById(restaurantId)
      .select("name menu")
      .lean();
    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    // Create a map of menu item IDs to names
    const menuItemMap = new Map<string, string>();
    restaurant.menu.forEach((item) => {
      if (item._id) {
        menuItemMap.set(item._id.toString(), item.itemName);
      }
    });

    // Get start of today (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Aggregation pipeline for order metrics
    const orderMetrics = await Order.aggregate<{
      totalOrders: number;
      todayOrders: number;
      totalRevenue: number;
      pendingOrders: number;
      activeOrders: number;
      averageOrderValue: number;
      uniqueCustomers: number;
      popularDishes: Array<{ itemId: Types.ObjectId; orderCount: number }>;
      revenueTrend: Array<{ _id: string; revenue: number }>;
    }>([
      // Match orders for this restaurant
      {
        $match: {
          restaurantId: restaurantId,
        },
      },
      // Unwind items for popular dishes
      {
        $unwind: "$items",
      },
      // Group to calculate metrics
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          todayOrders: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", today] }, 1, 0],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "delivered"] }, "$totalAmount", 0],
            },
          },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          activeOrders: {
            $sum: {
              $cond: [
                { $in: ["$status", ["accepted", "preparing"]] },
                1,
                0,
              ],
            },
          },
          averageOrderValue: { $avg: "$totalAmount" },
          uniqueCustomers: { $addToSet: "$userId" },
          popularDishes: {
            $push: {
              itemId: "$items.itemId",
              orderCount: "$items.quantity",
            },
          },
        },
      },
      // Group popular dishes by itemId
      {
        $unwind: "$popularDishes",
      },
      {
        $group: {
          _id: "$popularDishes.itemId",
          orderCount: { $sum: "$popularDishes.orderCount" },
          totalOrders: { $first: "$totalOrders" },
          todayOrders: { $first: "$todayOrders" },
          totalRevenue: { $first: "$totalRevenue" },
          pendingOrders: { $first: "$pendingOrders" },
          activeOrders: { $first: "$activeOrders" },
          averageOrderValue: { $first: "$averageOrderValue" },
          uniqueCustomers: { $first: "$uniqueCustomers" },
        },
      },
      // Sort popular dishes by order count
      {
        $sort: { orderCount: -1 },
      },
      // Limit to top 3 popular dishes
      {
        $limit: 3,
      },
      // Group back to single document
      {
        $group: {
          _id: null,
          totalOrders: { $first: "$totalOrders" },
          todayOrders: { $first: "$todayOrders" },
          totalRevenue: { $first: "$totalRevenue" },
          pendingOrders: { $first: "$pendingOrders" },
          activeOrders: { $first: "$activeOrders" },
          averageOrderValue: { $first: "$averageOrderValue" },
          uniqueCustomers: { $first: "$uniqueCustomers" },
          popularDishes: {
            $push: {
              itemId: "$_id",
              orderCount: "$orderCount",
            },
          },
        },
      },
      // Project to format output
      {
        $project: {
          totalOrders: 1,
          todayOrders: 1,
          totalRevenue: 1,
          pendingOrders: 1,
          activeOrders: 1,
          averageOrderValue: { $round: ["$averageOrderValue", 2] },
          uniqueCustomers: { $size: "$uniqueCustomers" },
          popularDishes: 1,
          _id: 0,
        },
      },
    ]);

    // Aggregation for revenue trend (last 7 days)
    const revenueTrend = await Order.aggregate<{
      _id: string;
      revenue: number;
    }>([
      // Match orders for this restaurant from last 7 days
      {
        $match: {
          restaurantId: restaurantId,
          createdAt: {
            $gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      // Group by day
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
        },
      },
      // Sort by date
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format revenue trend for the last 7 days
    const formattedTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const day = format(date, "EEE");
      const dateStr = format(date, "yyyy-MM-dd");
      const trendEntry = revenueTrend.find((t) => t._id === dateStr);
      return {
        day,
        revenue: trendEntry ? trendEntry.revenue : 0,
      };
    }).reverse();

    // Fetch recent orders (last 5)
    const recentOrders = await Order.find({
      restaurantId: restaurantId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id totalAmount status createdAt items")
      .lean()
      .then((orders) =>
        orders.map((order) => ({
          _id: order._id.toString(),
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt.toISOString(),
          items: order.items.map((item) => ({
            itemName: menuItemMap.get(item.itemId.toString()) || "Unknown Item",
            quantity: item.quantity,
            price: item.price,
          })),
        }))
      );

    // Default metrics if no orders
    const metrics = orderMetrics[0] || {
      totalOrders: 0,
      todayOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      activeOrders: 0,
      averageOrderValue: 0,
      uniqueCustomers: 0,
      popularDishes: [],
    };

    // Format popular dishes
    const formattedPopularDishes = metrics.popularDishes.map((dish) => ({
      itemName: menuItemMap.get(dish.itemId.toString()) || "Unknown Item",
      itemId: dish.itemId.toString(),
      orderCount: dish.orderCount,
    }));

    // Send response
    res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully",
      data: {
        ...metrics,
        restaurantName: restaurant.name,
        popularDishes: formattedPopularDishes,
        revenueTrend: formattedTrend,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard summary",
    });
  }
};




// Search and filter menu items across all restaurants
export const searchFoodItems = async (req: Request, res: Response) => {
  try {
    const {
      q = "", // Search query
      category = "All", // Category filter
      minPrice = 0, // Minimum price
      maxPrice = 100, // Maximum price
      vegetarian = false, // Vegetarian filter (assuming category-based for now)
      sortBy = "relevance", // Sort option
    } = req.query;

    // Build aggregation pipeline
    const pipeline: any[] = [
      // Unwind menu array to query individual menu items
      { $unwind: "$menu" },
      // Match stage for filtering
      {
        $match: {
          // Search query
          ...(q && {
            $or: [
              { "menu.itemName": { $regex: q as string, $options: "i" } },
              { "menu.description": { $regex: q as string, $options: "i" } },
              { name: { $regex: q as string, $options: "i" } },
            ],
          }),
          // Category filter
          ...(category !== "All" && { "menu.category": category }),
          // Price range filter
          "menu.price": { $gte: Number(minPrice), $lte: Number(maxPrice) },
          // Vegetarian filter (assuming vegetarian categories like "Salad" or "Dessert")
          ...(vegetarian === "true" && {
            "menu.category": { $in: ["Salad", "Dessert"] }, // Add more categories as needed
          }),
        },
      },
      // Project relevant fields
      {
        $project: {
          id: "$menu._id",
          name: "$menu.itemName",
          description: "$menu.description",
          price: "$menu.price",
          image: "$menu.imageUrl",
          category: "$menu.category",
          restaurant: "$name",
          rating: "$rating",
          deliveryTime: "$deliveryTime",
          vegetarian: {
            $in: ["$menu.category", ["Salad", "Dessert"]], // Adjust as per your logic
          },
        },
      },
    ];

    // Add sort stage
    switch (sortBy) {
      case "price-low":
        pipeline.push({ $sort: { price: 1 } });
        break;
      case "price-high":
        pipeline.push({ $sort: { price: -1 } });
        break;
      case "rating":
        pipeline.push({ $sort: { rating: -1 } });
        break;
      default:
        // Relevance: no specific sort
        break;
    }

    // Execute aggregation
    const foodItems = await Restaurant.aggregate(pipeline);

    res.status(200).json({
      status: "success",
      results: foodItems.length,
      data: foodItems,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch menu items",
      error: error.message,
    });
  }
};

// Search and filter restaurants
export const searchRestaurants = async (req: Request, res: Response) => {
  try {
    const {
      q = "", // Search query
      category = "All", // Category filter (based on cuisines)
      sortBy = "relevance", // Sort option
    } = req.query;

    // Build query
    let query: any = {};

    // Apply search query
    if (q) {
      query.$or = [
        { name: { $regex: q as string, $options: "i" } },
        { cuisines: { $regex: q as string, $options: "i" } },
      ];
    }

    // Apply category filter (match with cuisines)
    if (category !== "All") {
      query.cuisines = { $regex: category as string, $options: "i" };
    }

    // Build sort options
    let sortOptions: any = {};
    switch (sortBy) {
      case "rating":
        sortOptions.rating = -1;
        break;
      default:
        // Relevance: no specific sort
        break;
    }

    // Fetch restaurants
    const restaurants = await Restaurant.find(query)
      .sort(sortOptions)
      .select("name restaurantImage cuisines rating deliveryTime deliveryFee deliveryFee location");

    res.status(200).json({
      status: "success",
      results: restaurants.length,
      data: restaurants,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch restaurants",
      error: error.message,
    });
  }
};