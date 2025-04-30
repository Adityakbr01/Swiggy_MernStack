import type{ Request, Response } from "express";
import { io } from "../../index"; // Import Socket.IO instance from index.ts
import Rider from "@/models/riderModel"; // Your Rider model
import Order from "@/models/orderModel"; // Your Order model
import { sendErrorResponse, sendSuccessResponse } from "@/utils/responseUtil"; // Your response utilities
import { logger } from "@/utils/logger"; // Assuming logger utility
import asyncHandler from "express-async-handler"; // Your asyncHandler
import type { AuthRequest } from "@/middlewares/authMiddleware";
import { Types } from "mongoose";
import User from "@/models/userModel";
import { format } from "date-fns";



// Get available riders (for restaurant/admin)
export const getAvailableRiders = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== "restaurant" && req.user?.role !== "admin") {
     sendErrorResponse(res, 403, "Not authorized");
     return
  }

  const riders = await Rider.find({ status: "available" })
    .populate("userId", "name phone")
    .select("-__v");
  logger.info(`Fetched ${riders.length} available riders`);
   sendSuccessResponse(res, 200, "Available riders fetched successfully", riders);
   return
});

// Assign rider to order (for restaurant/admin)
export const assignRiderToOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { riderUserId } = req.body; // Expecting User ID of the rider
  const orderId = req.params.orderId;

  if (req.user?.role !== "restaurant" && req.user?.role !== "admin") {
     sendErrorResponse(res, 403, "Not authorized");
     return
  }

  const order = await Order.findById(orderId);
  const rider = await Rider.findOne({ userId: riderUserId });

  if (!order) {
     sendErrorResponse(res, 404, "Order not found");
     return
  }
  if (!rider) {
     sendErrorResponse(res, 404, "Rider not found");
     return
  }
  if (rider.status !== "available") {
     sendErrorResponse(res, 400, "Rider is not available");
     return
  }

  order.riderId = riderUserId;
  order.status = "assigned";
  rider.status = "busy";
  rider.assignedOrders.push(order._id);

  await order.save();
  await rider.save();

  // Emit rider assignment to relevant rooms
  io.to(`user_${order.userId}`)
    .to(`restaurant_${order.restaurantId[0]}`)
    .to(`rider_${riderUserId}`)
    .emit("orderAssigned", {
      orderId,
      riderId: riderUserId,
      status: order.status,
      timestamp: new Date(),
    });

  logger.info(`Rider ${riderUserId} assigned to order ${orderId}`);
   sendSuccessResponse(res, 200, "Rider assigned successfully", { orderId, riderId: riderUserId });
   return
});

// Update rider location
export const updateRiderLocation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { longitude, latitude } = req.body; // Expecting GeoJSON order: [lng, lat]
  const riderUserId = req.user?._id;

  if (!riderUserId) {
     sendErrorResponse(res, 401, "Unauthorized: Rider ID not found");
     return
  }

  if (typeof longitude !== "number" || typeof latitude !== "number") {
     sendErrorResponse(res, 400, "Invalid longitude or latitude");
    return
  }

  const rider = await Rider.findOne({ userId: riderUserId });
  if (!rider) {
     sendErrorResponse(res, 404, "Rider not found");
    return
  }

  rider.currentLocation = { type: "Point", coordinates: [longitude, latitude] };
  rider.lastUpdated = new Date();
  await rider.save();

  // Emit location update to relevant rooms
  io.to(`rider_${riderUserId}`).emit("riderLocationUpdate", {
    riderId: riderUserId,
    location: { type: "Point", coordinates: [longitude, latitude] },
    timestamp: new Date(),
  });

  // Emit to user and restaurant rooms for active orders
  const activeOrders = await Order.find({
    riderId: riderUserId,
    status: { $in: ["assigned", "out-for-delivery"] },
  });
  activeOrders.forEach((order) => {
    io.to(`user_${order.userId}`)
      .to(`restaurant_${order.restaurantId[0]}`)
      .emit("orderLocationUpdate", {
        orderId: order._id,
        riderId: riderUserId,
        location: { type: "Point", coordinates: [longitude, latitude] },
        timestamp: new Date(),
      });
  });

  logger.info(`Rider ${riderUserId} location updated: ${longitude}, ${latitude}`);
   sendSuccessResponse(res, 200, "Location updated successfully", {
    location: { type: "Point", coordinates: [longitude, latitude] },
  });
  return
});

// Get rider's orders
export const getRiderOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const riderUserId = req.user?._id || req.user?.id;

  if (!riderUserId) {
     sendErrorResponse(res, 401, "Unauthorized: Rider ID not found");
     return
  }

  const rider = await Rider.findOne({ userId: riderUserId }).populate({
    path: "assignedOrders",
    populate: { path: "userId restaurantId", select: "name phone" },
  });
  if (!rider) {
     sendErrorResponse(res, 404, "Rider not found");
     return
  }

  logger.info(`Fetched orders for rider ${riderUserId}`);
   sendSuccessResponse(res, 200, "Rider orders fetched successfully", rider.assignedOrders);
   return
});

// Accept an order
export const acceptOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const riderUserId = req.user?._id;

  if (!riderUserId) {
     sendErrorResponse(res, 401, "Unauthorized: Rider ID not found");
     return
  }

  const order = await Order.findById(orderId);
  if (!order) {
     sendErrorResponse(res, 404, "Order not found");
     return
  }

  if (order.riderId && order.riderId.toString() !== riderUserId) {
     sendErrorResponse(res, 403, "Order already assigned to another rider");
     return
  }

  if (order.status !== "assigned") {
     sendErrorResponse(res, 400, "Order cannot be accepted in current status");
     return
  }

  order.status = "accepted";
  await order.save();

  // Emit order acceptance to relevant rooms
  io.to(`user_${order.userId}`)
    .to(`restaurant_${order.restaurantId[0]}`)
    .to(`rider_${riderUserId}`)
    .emit("orderStatusUpdate", {
      orderId,
      status: order.status,
      riderId: riderUserId,
      timestamp: new Date(),
    });

  logger.info(`Rider ${riderUserId} accepted order ${orderId}`);
   sendSuccessResponse(res, 200, "Order accepted successfully", { orderId, status: order.status });
   return
});

// Update order status
export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const riderUserId = req.user?._id;

  if (!riderUserId) {
     sendErrorResponse(res, 401, "Unauthorized: Rider ID not found");
     return
  }

  const validRiderStatuses = ["out-for-delivery", "delivered", "cancelled"];
  if (!validRiderStatuses.includes(status)) {
     sendErrorResponse(res, 400, `Invalid status. Must be one of: ${validRiderStatuses.join(", ")}`);
     return
  }

  const order = await Order.findById(orderId);
  if (!order) {
     sendErrorResponse(res, 404, "Order not found");
     return
  }

  if (order.riderId?.toString() !== riderUserId) {
     sendErrorResponse(res, 403, "Not authorized to update this order");
     return
  }

  if (order.paymentStatus !== "paid" && status === "out-for-delivery") {
     sendErrorResponse(res, 400, "Payment must be completed before delivery");
     return
  }

  // Define valid status transitions for riders
  const validTransitions: Record<string, string[]> = {
    accepted: ["out-for-delivery", "cancelled"],
    "out-for-delivery": ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
  };

  if (!validTransitions[order.status]?.includes(status)) {
     sendErrorResponse(res, 400, `Cannot transition from ${order.status} to ${status}`);
     return
  }

  order.status = status;
  await order.save();

  // Update rider status if order is completed/cancelled
  if (status === "delivered" || status === "cancelled") {
    const rider = await Rider.findOne({ userId: riderUserId });
    if (rider) {
      rider.status = "available";
      rider.assignedOrders = rider.assignedOrders.filter((id) => id.toString() !== orderId);
      await rider.save();
    }
  }

  // Emit status update to relevant rooms
  io.to(`user_${order.userId}`)
    .to(`restaurant_${order.restaurantId[0]}`)
    .to(`rider_${riderUserId}`)
    .emit("orderStatusUpdate", {
      orderId,
      status: order.status,
      riderId: riderUserId,
      timestamp: new Date(),
    });

  logger.info(`Rider ${riderUserId} updated order ${orderId} to status ${status}`);
   sendSuccessResponse(res, 200, "Order status updated successfully", { orderId, status });
   return
});

// Controller to fetch rider dashboard summary
export const getRiderDashboardSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized: Please log in as a rider" });
      return;
    }

    const riderId = new Types.ObjectId(req.user.id);
    const user = await User.findById(riderId).select("name riderDetails").lean();
    if (!user) {
      res.status(404).json({ success: false, message: "Rider not found" });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Aggregation for metrics
    const metrics = await Order.aggregate<{
      todayDeliveries: number;
      pendingDeliveries: number;
      totalEarnings: number;
      activeOrders: number;
    }>([
      { $match: { riderId, status: { $in: ["ready", "picked", "delivered"] } } },
      {
        $group: {
          _id: null,
          todayDeliveries: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$status", "delivered"] }, { $gte: ["$createdAt", today] }] }, 1, 0],
            },
          },
          pendingDeliveries: {
            $sum: { $cond: [{ $in: ["$status", ["ready", "picked"]] }, 1, 0] },
          },
          totalEarnings: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, "$deliveryFee", 0] },
          },
          activeOrders: {
            $sum: { $cond: [{ $eq: ["$status", "picked"] }, 1, 0] },
          },
        },
      },
      { $project: { _id: 0, todayDeliveries: 1, pendingDeliveries: 1, totalEarnings: 1, activeOrders: 1 } },
    ]);

    // Aggregation for earnings trend
    const earningsTrend = await Order.aggregate<{
      _id: string;
      earnings: number;
    }>([
      {
        $match: {
          riderId,
          status: "delivered",
          createdAt: { $gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          earnings: { $sum: "$deliveryFee" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format earnings trend for 7 days
    const formattedTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = format(date, "yyyy-MM-dd");
      const trendEntry = earningsTrend.find((t) => t._id === dateStr);
      return { day: format(date, "EEE"), earnings: trendEntry ? trendEntry.earnings : 0 };
    }).reverse();

    // Fetch recent orders
    const recentOrders = await Order.find({ riderId, status: { $in: ["ready", "picked", "delivered"] } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("restaurantId", "name")
      .lean()
      .then((orders) =>
        orders.map((order) => ({
          _id: order._id.toString(),
          restaurantName: (order.restaurantId as any)?.name || "Unknown Restaurant",
          totalAmount: order.totalAmount,
          deliveryFee: order.deliveryFee || 0,
          status: order.status,
          createdAt: order.createdAt.toISOString(),
          deliveryAddress: order.deliveryAddress || "N/A",
        }))
      );

    const metricsData = metrics[0] || {
      todayDeliveries: 0,
      pendingDeliveries: 0,
      totalEarnings: 0,
      activeOrders: 0,
    };

    const rider = await Rider.findOne({ userId: riderId }).select("status").lean();
    res.status(200).json({
      success: true,
      message: "Rider dashboard summary fetched successfully",
      data: {
        ...metricsData,
        riderName: user.name || "Rider",
        availability: rider?.status === "available",
        earningsTrend: formattedTrend,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching rider dashboard summary:", error);
    res.status(500).json({ success: false, message: "Server error while fetching dashboard summary" });
  }
};

// Update rider availability
export const availability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const riderUserId = req.user?.id;
  const { availability } = req.body as { availability: boolean };

  if (!riderUserId) {
   sendErrorResponse(res, 401, "Unauthorized: Rider ID not found");
   return;
 }
 
 if (typeof availability !== "boolean") {
   sendErrorResponse(res, 400, "Invalid input: availability must be a boolean");
   return;
 }
 

  const user = await User.findById(riderUserId);
  if (!user) {
    sendErrorResponse(res, 404, "User not found");
    return;
  }

  if (user.role !== "rider") {
    sendErrorResponse(res, 403, "Not authorized: Must be a rider");
    return;
  }

  if (typeof availability !== "boolean") {
    sendErrorResponse(res, 400, "Invalid input: availability must be a boolean");
    return;
  }

  const rider = await Rider.findOne({ userId: new Types.ObjectId(riderUserId) });
  if (!rider) {
    sendErrorResponse(res, 404, "Rider not found");
    return;
  }

  // Check for active orders if setting to available
  if (availability) {
    const activeOrders = await Order.find({
      riderId: new Types.ObjectId(riderUserId),
      status: { $in: ["assigned", "accepted", "out-for-delivery"] },
    }).lean();

    if (activeOrders.length > 0) {
      sendErrorResponse(res, 400, "Cannot set available: Complete or cancel active orders first");
      return;
    }
  }

  // Map boolean to Rider status
  const newStatus = availability ? "available" : "offline";

  // Prevent redundant updates
  if (rider.status === newStatus) {
    sendSuccessResponse(res, 200, `Rider already ${newStatus}`, { status: newStatus });
    return;
  }

  rider.status = newStatus;
  rider.lastUpdated = new Date();
  await rider.save();

  // Emit Socket.IO event to notify restaurants/admins
  io.to("restaurants").emit("riderAvailabilityUpdate", {
    riderId: riderUserId,
    status: newStatus,
    timestamp: new Date(),
  });

  logger.info(`Rider ${riderUserId} updated availability to ${newStatus}`);
  sendSuccessResponse(res, 200, "Availability updated successfully", { status: newStatus });
});


// Existing controllers (unchanged): getAvailableRiders, assignRiderToOrder, updateRiderLocation, getRiderOrders, acceptOrder, updateOrderStatus, getRiderDashboardSummary
// ... (your provided controllers)

// Get all orders for rider (fixed and improved)
export const getAllOrdersForRider = asyncHandler(async (req: AuthRequest, res: Response) => {
  const riderUserId = req.user?.id;

  if (!riderUserId) {
    sendErrorResponse(res, 401, "Unauthorized: Rider ID not found");
    return;
  }

  const rider = await Rider.findOne({ userId: riderUserId }).lean();
  if (!rider) {
    sendErrorResponse(res, 404, "Rider not found");
    return;
  }

  // Query parameters for filtering and pagination
  const {
    status,
    page = "1",
    limit = "10",
    dateFrom,
    dateTo,
  } = req.query as {
    status?: string;
    page?: string;
    limit?: string;
    dateFrom?: string;
    dateTo?: string;
  };

  const query: any = {
    $or: [
      { riderId: new Types.ObjectId(riderUserId), status: { $in: ["assigned", "accepted", "out-for-delivery", "delivered"] } },
      { status: "assigned", riderId: { $exists: false } }, // Unassigned orders for acceptance
    ],
  };

  // Filter by status if provided
  if (status) {
    query.$or = [{ ...query.$or[0], status }, { ...query.$or[1], status }];
  }

  // Filter by date range if provided
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Fetch orders with pagination
  const orders = await Order.find(query)
    .populate("restaurantId", "name location")
    .populate("userId", "name phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean()
    .then((orders) =>
      orders.map((order) => ({
        _id: order._id.toString(),
        restaurantName: (order.restaurantId as any)?.name || "Unknown Restaurant",
        restaurantAddress: (order.restaurantId as any)?.location
          ? `${(order.restaurantId as any).location.street}, ${(order.restaurantId as any).location.city}`
          : "N/A",
        customerName: (order.userId as any)?.name || "Unknown Customer",
        customerPhone: (order.userId as any)?.phone || "N/A",
        totalAmount: order.totalAmount,
        deliveryFee: order.deliveryFee || 50, // Default if not set
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        deliveryAddress: order.deliveryAddress
          ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.pincode}`
          : "N/A",
      }))
    );

  // Get total count for pagination
  const totalOrders = await Order.countDocuments(query);

  logger.info(`Fetched ${orders.length} orders for rider ${riderUserId}`);
  sendSuccessResponse(res, 200, "Rider orders fetched successfully", {
    orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: totalOrders,
      totalPages: Math.ceil(totalOrders / limitNum),
    },
  });
});
