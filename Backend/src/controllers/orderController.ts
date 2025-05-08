// @controllers/orderController.js
import type { AuthRequest } from "@middlewares/authMiddleware";
import Order from "@models/orderModel";
import Restaurant from "@models/restaurantModel";
import User from "@models/userModel";
import { sendErrorResponse, sendSuccessResponse } from "@utils/responseUtil";
import type { Response } from "express";
import asyncHandler from "express-async-handler";
import mongoose, { Types } from "mongoose";
import { io } from "../../index";
import Rider from "@/models/riderModel";

// @desc Create order (customer) 
// @route POST /api/v1/orders ☘️
// @access Private

export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user.id);
    if (!user) {
      sendErrorResponse(res, 404, "User not found");
      return;
    }

    const items = req.body.items;
    if (!items || items.length === 0) {
      sendErrorResponse(res, 400, "No items provided");
      return;
    }

    // Validate restaurants exist
    const restaurantIds = [...new Set(items.map((item: any) => item.restaurantId))];
    const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } });
    if (restaurants.length !== restaurantIds.length) {
      sendErrorResponse(res, 400, "One or more restaurants not found");
      return;
    }

    // Calculate total amount and prepare items with restaurantId
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const orderItems = items.map((item: any) => ({
      itemId: item.itemId,
      itemName: item.itemName,
      price: item.price,
      quantity: item.quantity,
      restaurantId: item.restaurantId, // Include restaurantId
    }));

    // Create a single order
    const order = await Order.create({
      userId: req.user.id,
      restaurantId: restaurantIds,
      items: orderItems,
      totalAmount,
      deliveryAddress: req.body.deliveryAddress,
      status: "pending",
      riderId: null,
      paymentMethod: req.body.paymentMethod,
      notes: req.body.notes,
      orderType: req.body.orderType,
      contactNumber: req.body.contactNumber,
    });

    // Add order to each restaurant's orders array
    try {
      await Restaurant.updateMany(
        { _id: { $in: restaurantIds } },
        { $push: { orders: order._id } }
      );
      console.log(`Order ${order._id} added to restaurants: ${restaurantIds.join(", ")}`);
    } catch (error) {
      console.error("Failed to update restaurant orders:", error);
    }

    sendSuccessResponse(res, 200, "Order created successfully", order);
  }
);

// @desc Get order by ID
// @route GET /api/v1/orders/:id
// @access Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("userId", "name email")
    .populate("restaurantId", "name deliveryTime").populate("riderId", "name email profileImage");
  if (order && (order.userId._id.toString() === req.user.id.toString() || req.user.role !== "customer")) {
    res.json(order);
  } else {
    res.status(403);
    throw new Error("Not authorized or order not found");
  }
});

// @desc Get restaurant orders
// @route GET /api/v1/orders/:id
// @access Private
export const getRestaurantOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ restaurantId: req.params.id })
    .populate("userId", "name email")
    .populate("restaurantId", "name");
  res.json(orders);
});

// @desc Get user's orders
// @route GET /api/v1/orders/my-orders ☘️
// @access Private
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user.id })
    .populate("restaurantId", "name");
  res.json(orders);
});

// @desc Update order status


// @route PUT /api/v1/orders/:id/status
// @access Private
// export const updateOrderStatus = asyncHandler(async (req, res) => {
//   const order = await Order.findById(req.params.id);

//   if (!order) {
//     res.status(404);
//     throw new Error("Order not found");
//   }

//   console.log("Order restaurantId:", order.restaurantId);

//   const RestaurantOwner = await User.findById(req.user.id);

//   if (!RestaurantOwner) {
//     res.status(403);
//     throw new Error("Not authorized");
//   }

//   // Check if user's OWN_Restaurant is in order.restaurantId array
//   const isRestaurant = order.restaurantId.some((id) =>
//     id.equals(RestaurantOwner.OWN_Restaurant)
//   );
//   const isRider = order.riderId && order.riderId.equals(req.user.id);
//   const isAdmin = req.user.role === "admin";

//   console.log("isRestaurant:", isRestaurant, "isRider:", isRider, "role:", req.user.role);

//   if (isRestaurant || isRider || isAdmin) {
//     const { status, riderId } = req.body;

//     console.log(status, riderId);

//     // Validate status
//     const validStatuses = [
//       "pending",
//       "accepted",
//       "preparing",
//       "assigned",
//       "out-for-delivery",
//       "delivered",
//       "cancelled",
//     ];
//     if (!validStatuses.includes(status)) {
//       res.status(400);
//       throw new Error("Invalid status");
//     }

//     // Update fields
//     order.status = status;
//     if (riderId && mongoose.Types.ObjectId.isValid(riderId)) {
//       order.riderId = riderId;
//     }

//     // Ensure items have restaurantId
//     order.items = order.items.map((item) => ({
//       ...item,
//       restaurantId: item.restaurantId || order.restaurantId[0],
//     }));

//     // Ensure contactNumber
//     if (!order.contactNumber) {
//       order.contactNumber = "N/A";
//     }

    
//     if(status === "pending") {
//       io.emit("orderPending", {
//         orderId: order._id,
//         status: order.status,
//         restaurant: order.restaurantId,
//         riderId: order.riderId,
//       });
//     }

//         // if status accepted socket io to show this order to riders
//         if (status === "accepted") {
//           io.emit("orderAccepted", {
//             orderId: order._id,
//             status: order.status,
//             restaurant: order.restaurantId,
//             riderId: order.riderId,
//           });
//         }

//         // if status assigned socket io to show this order to rider and user
//         if (status === "assigned") {
//           io.emit("orderAssigned", {
//             orderId: order._id,
//             status: order.status,
//             restaurant: order.restaurantId,
//             riderId: order.riderId,
//           });
//         }

//         // if status preparing socket io to show this order to rider and user
//         if (status === "preparing") {
//           io.emit("orderPreparing", {
//             orderId: order._id,
//             status: order.status,
//             restaurant: order.restaurantId,
//             riderId: order.riderId,
//           });
//         }

//         // if status out-for-delivery socket io to show this order to rider and user
//         if (status === "out-for-delivery") {
//           io.emit("orderOutForDelivery", {
//             orderId: order._id,
//             status: order.status,
//             restaurant: order.restaurantId,
//             riderId: order.riderId,
//           });
//         }

//         // if status delivered socket io to show this order to rider and user
//         if (status === "delivered") {
//           io.emit("orderDelivered", {
//             orderId: order._id,
//             status: order.status,
//             restaurant: order.restaurantId,
//             riderId: order.riderId,
//           });
//         }

//         // if status cancelled socket io to show this order to rider and user
//         if (status === "cancelled") {
//           io.emit("orderCancelled", {
//             orderId: order._id,
//             status: order.status,
//             restaurant: order.restaurantId,
//             riderId: order.riderId,
//           });
//         }




//     await order.save();
//     sendSuccessResponse(res, 200, "Status updated", order);

//   } else {
//     res.status(403);
//     throw new Error("Not authorized");
//   }
// });



// export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res) => {
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) {
//       res.status(404);
//       throw new Error("Order not found");
//     }

//     const userId = req.user.id || req.user._id;
//     if (!userId) {
//       res.status(401);
//       throw new Error("User not authenticated");
//     }

//     const currentUser = await User.findById(req.user.id);
//     if (!currentUser) {
//       res.status(403);
//       throw new Error("Not authorized");
//     }

//     const isRestaurant = Array.isArray(order.restaurantId)
//       ? order.restaurantId.some((id) => id.equals(currentUser.OWN_Restaurant))
//       : order.restaurantId === currentUser.OWN_Restaurant;

//     const isRiderAlreadyAssigned =
//       order.riderId && order.riderId.equals(req.user.id);

//     const isRiderAcceptingFirstTime =
//       !order.riderId && req.user.role === "rider";

//     const isRider = isRiderAlreadyAssigned || isRiderAcceptingFirstTime;

//     const isAdmin = req.user.role === "admin";

//     if (isRestaurant || isRider || isAdmin) {
//       const { status, riderId } = req.body;
//       const validStatuses = [
//         "pending",
//         "accepted",
//         "preparing",
//         "assigned",
//         "out-for-delivery",
//         "delivered",
//         "cancelled",
//       ];

//       if (!validStatuses.includes(status)) {
//         res.status(400);
//         throw new Error("Invalid status");
//       }

//       order.status = status;

//       if (riderId && mongoose.Types.ObjectId.isValid(riderId)) {
//         order.riderId = riderId;
//       } else if (isRiderAcceptingFirstTime) {
//         order.riderId = new Types.ObjectId(req.user.id);
//       }

//       // Fix: Add missing restaurantId to items
//       order.items = order.items.map((item) => ({
//         ...item,
//         restaurantId: item.restaurantId || order.restaurantId[0],
//       }));

//       if (!order.contactNumber) {
//         order.contactNumber = "N/A";
//       }

//       const payload = {
//         orderId: order._id,
//         status: order.status,
//         restaurant: order.restaurantId,
//         riderId: order.riderId,
//       };

//       const eventMap = {
//         pending: "orderPending",
//         accepted: "orderAccepted",
//         preparing: "orderPreparing",
//         assigned: "orderAssigned",
//         "out-for-delivery": "orderOutForDelivery",
//         delivered: "orderDelivered",
//         cancelled: "orderCancelled",
//       };

//       const eventName = eventMap[status];

//       // Global Events
//       io.emit(eventName, payload);

//       // Emit to user
//       io.to(`user_${order.userId}`).emit(eventName, { orderId: order._id, status });

//       // Emit to restaurant(s)
//       (Array.isArray(order.restaurantId)
//         ? order.restaurantId
//         : [order.restaurantId]
//       ).forEach((resId) => {
//         io.to(`restaurant_${resId}`).emit(eventName, {
//           orderId: order._id,
//           status,
//         });
//       });

//       // Emit to rider if assigned
//       if (order.riderId) {
//         io.to(`rider_${order.riderId}`).emit(eventName, {
//           orderId: order._id,
//           status,
//         });
//       }

//       await order.save();
//       sendSuccessResponse(res, 200, "Status updated", order);
//     } else {
//       res.status(403);
//       throw new Error("Not authorized to update this order");
//     }
//   } catch (error:unknown) {
//     console.error("Update status error:", error.message);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Server Error",
//     });
//   }
// });




export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const userId = req.user.id || req.user._id;
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      res.status(403);
      throw new Error("Not authorized");
    }

    // LOG: Debug role and restaurant
    console.log("CurrentUser:", currentUser.role, currentUser.OWN_Restaurant);

    // Check if current user is a restaurant
    const isRestaurant = Array.isArray(order.restaurantId)
      ? order.restaurantId.some((id) =>
          id.toString() === currentUser.OWN_Restaurant?.toString()
        )
      : order.restaurantId.toString() === currentUser.OWN_Restaurant?.toString();

    // Check if rider is already assigned or accepting first time
    const isRiderAlreadyAssigned =
      order.riderId && order.riderId.toString() === userId?.toString();

    const isRiderAcceptingFirstTime =
      !order.riderId && req.user.role === "rider";

    const isRider = isRiderAlreadyAssigned || isRiderAcceptingFirstTime;

    console.log("isRestaurant:", isRestaurant, "isRider:", isRider, "role:", req.user.role);



    const isAdmin = req.user.role === "admin";

    if (isRestaurant || isRider || isAdmin) {
      const { status, riderId } = req.body;
      
      const isAvailable = await Rider.findOne({ userId: userId, $or: [{ status: "available" }, { status: "busy" }] });

      if(!isAvailable){
        sendErrorResponse(res, 400, "Rider please go to online then accept order");
        throw new Error("Rider please go to online then accept order");
      }


      const validStatuses = [
        "pending",
        "accepted",
        "preparing",
        "assigned",
        "out-for-delivery",
        "delivered",
        "cancelled",
      ];

      if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error("Invalid status");
      }

      order.status = status;

      if (riderId && Types.ObjectId.isValid(riderId)) {
        order.riderId = riderId;
      } else if (isRiderAcceptingFirstTime) {
        order.riderId = new Types.ObjectId(userId);
      }

      order.items = order.items.map((item) => ({
        ...item,
        restaurantId: item.restaurantId || (Array.isArray(order.restaurantId) ? order.restaurantId[0] : order.restaurantId),
      }));

      if (!order.contactNumber) {
        order.contactNumber = "N/A";
      }

      const payload = {
        orderId: order._id,
        status: order.status,
      };

      type OrderStatus =
        | "pending"
        | "accepted"
        | "preparing"
        | "assigned"
        | "out-for-delivery"
        | "delivered"
        | "cancelled";

      const eventMap: Record<OrderStatus, string> = {
        pending: "orderPending",
        accepted: "orderAccepted",
        preparing: "orderPreparing",
        assigned: "orderAssigned",
        "out-for-delivery": "orderOutForDelivery",
        delivered: "orderDelivered",
        cancelled: "orderCancelled",
      };

      if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error("Invalid status");
      }

      // Tell TypeScript status is of type OrderStatus
      const eventName = eventMap[status as OrderStatus];

      // Send notifications to specific user, restaurant(s), and rider
      io.to(`user_${order.userId}`).emit(eventName, payload);
      (Array.isArray(order.restaurantId) ? order.restaurantId : [order.restaurantId]).forEach(
        (resId) => {
          io.to(`restaurant_${resId}`).emit(eventName, payload);
        }
      );
      if (order.riderId) {
        io.to(`rider_${order.riderId}`).emit(eventName, payload);
      }

      await order.save();
      sendSuccessResponse(res, 200, "Status updated", order);
      return;
    } else {
      console.log("Unauthorized access: ", {
        userRole: req.user.role,
        restaurantMatch: isRestaurant,
        riderMatch: isRider,
        admin: isAdmin,
      });

      res.status(403);
      throw new Error("Not authorized to update this order");
    }
  } catch (error: any) {
    console.error("Update status error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
});


// @desc Get available orders for rider
// @route GET /api/v1/orders/available
// @access Private
export const availableOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    status: { $in: ["accepted", "preparing"] },
    riderId: null,
  })
    .populate("restaurantId", "name") // Populate restaurantId with the name field
    .exec(); // Execute the query

    console.log(orders);

  res.status(200).json(
    orders.map((order) => ({
      orderId: order._id,
      status: order.status,
      restaurantName: (order.restaurantId as any)?.name || "Unknown", // Type assertion
      deliveryAddress: order.deliveryAddress,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: order.items,
    }))
  );
});

  




// @desc Cancel order
// @route DELETE /api/v1/orders/:id
// @access Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order && order.userId.toString() === req.user.id.toString() && order.status === "pending") {
    order.status = "cancelled";
    await order.save();
    res.json({ message: "Order cancelled" });
  } else {
    res.status(403);
    throw new Error("Not authorized or order cannot be cancelled");
  }
});




// @desc Get all orders for a restaurant
// @route GET /api/v1/paidOrders
// @access Private

interface OrderItem extends mongoose.Document {
  itemId: string;
  price: number;
  quantity: number;
  itemName?: string;
  menuPrice?: number;

}

interface OrderDocument extends mongoose.Document {
  restaurantId: mongoose.Types.ObjectId[];
  items: OrderItem[];
  paymentStatus: string;
  totalAmount: number;
  
}

export const getPaidOrders = asyncHandler(async (req: AuthRequest, res: Response) => {

  const user = await User.findById(req.user.id);
  if (!user) {
    sendErrorResponse(res, 404, "User not found");
    return;
  }

  if (!user.OWN_Restaurant) {
    sendErrorResponse(res, 403, "You don't have a restaurant, please create one");
    return;
  }

  const orders = await Order.find({
    restaurantId: user.OWN_Restaurant,
    paymentStatus: "paid",
    riderId: null,
  });

  if (!orders.length) {
    sendSuccessResponse(res, 200, "No paid orders found", []);
    return;
  }

  // Get restaurant with menu
  const restaurant = await Restaurant.findById(user.OWN_Restaurant).select("menu");
  if (!restaurant) {
    sendErrorResponse(res, 404, "Restaurant not found");
    return;
  }
  if (!restaurant.menu || !restaurant.menu.length) {
    sendErrorResponse(res, 404, "No items found in the restaurant's menu");
    return;
  }

  const menuItemsMap = new Map(
    restaurant.menu.map((item) => [
      item?._id?.toString(),
      { itemName: item.itemName, price: item.price },
    ])
  );
  const validMenuItemIds = new Set(restaurant.menu.map((item) => item._id?.toString()));

  const modifiedOrders = orders
    .map((order: any) => {
      order.restaurantId = [user.OWN_Restaurant!];

      order.items = order.items
        .filter((item: OrderItem) => validMenuItemIds.has(item.itemId.toString()))
        .map((item:any) => {
          const menuItem = menuItemsMap.get(item.itemId.toString());
          return {
            ...item.toObject(),
            itemName: menuItem?.itemName, 
            menuPrice: menuItem?.price, 
          };
        });

      order.totalAmount = order.items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );

      // Return order only if it has valid items
      return order.items.length > 0 ? order : null;
    })
    .filter((order) => order !== null);

  sendSuccessResponse(res, 200, "Paid orders retrieved successfully", modifiedOrders);
});
