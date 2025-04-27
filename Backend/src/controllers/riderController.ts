import type{ Request, Response } from "express";
import { io } from "../../index"; // Import Socket.IO instance from index.ts
import Rider from "@/models/riderModel"; // Your Rider model
import Order from "@/models/orderModel"; // Your Order model
import { sendErrorResponse, sendSuccessResponse } from "@/utils/responseUtil"; // Your response utilities
import { logger } from "@/utils/logger"; // Assuming logger utility
import asyncHandler from "express-async-handler"; // Your asyncHandler
import type { AuthRequest } from "@/middlewares/authMiddleware";



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

export const getAllOrdersForRider = asyncHandler(async (req: AuthRequest, res: Response) => {
  const riderUserId = req.user?.id;

  if (!riderUserId) {
     sendErrorResponse(res, 401, "Unauthorized: Rider ID not found");
     return
  }

//   const rider = await Rider.findOne({ userId: riderUserId });
//   if (!rider) {
//      sendErrorResponse(res, 404, "Rider not found");
//      return
//   }

  const orders = await Order.find({ status : "preparing" });
  res.json(orders);
})