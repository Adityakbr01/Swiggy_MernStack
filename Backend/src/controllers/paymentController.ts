// @controllers/paymentController.ts
import Razorpay from "razorpay";
import Order, { type IOrder } from "@models/orderModel"; // Assuming renamed to Order.ts
import Payment from "@models/paymentModel"; // Assuming renamed to Payment.ts
import asyncHandler from "express-async-handler";
import { type AuthRequest } from "@middlewares/authMiddleware";
import crypto from "crypto";
import { sendSuccessResponse } from "@utils/responseUtil";
import mongoose from "mongoose";
import Restaurant, { type IRestaurant } from "@models/restaurantModel";
import { sendRestaurantNotification } from "@utils/notificationUtil";

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// // Process Payment (Initiate Payment or Handle COD)
// export const processPayment = asyncHandler(async (req: AuthRequest, res) => {
//   const { orderId } = req.params;
//   const { method } = req.body; // "UPI", "card", "COD

//   // Debug: Check req.user
//   console.log("req.user:", req.user);
//   if (!req.user || (!req.user.id && !req.user._id)) {
//     res.status(401);
//     throw new Error("User not authenticated");
//   }

//   const userId = req.user.id || req.user._id; // Handle both cases (id or _id)
//   const order = await Order.findById(orderId);
//   console.log("Order:", order);
//   if (!order || order.userId.toString() !== userId?.toString()) {
//     res.status(404);
//     throw new Error("Order not found or not authorized");
//   }

//   if (order.paymentStatus === "paid") {
//     res.status(400);
//     throw new Error("Payment already completed for this order");
//   }

//   if (method === "COD") {
//     const payment = new Payment({
//       orderId,
//       userId,
//       amount: order.totalAmount,
//       status: "success",
//       method: "COD",
//     });
//     await payment.save();
//     order.paymentStatus = "paid";
//     await order.save();
//      sendSuccessResponse(res, 200, "COD payment recorded", payment);
//      return
//   }

//   // Online payment with Razorpay
//   const razorpayOrder = await razorpay.orders.create({
//     amount: order.totalAmount * 100, // Convert to paise
//     currency: "INR",
//     receipt: orderId,
//   });

//   const payment = new Payment({
//     orderId,
//     userId,
//     amount: order.totalAmount,
//     paymentId: razorpayOrder.id,
//     status: "pending",
//     method: method || "card", // Default to "card" if method not specified
//   });
//   await payment.save();

//    sendSuccessResponse(res, 200, "Payment initiated", {
//     razorpayOrderId: razorpayOrder.id,
//     amount: order.totalAmount * 100,
//     key: process.env.RAZORPAY_KEY_ID,
//     orderId: order._id,
//   });
//   return
// });



// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Controller: Process Payment (COD or Razorpay)
export const processPayment = asyncHandler(async (req:AuthRequest, res) => {
  const { orderId } = req.params;
  const { method } = req.body; // "UPI", "card", "COD"

  try {
    // Validate user
    if (!req.user || (!req.user.id && !req.user._id)) {
      res.status(401);
      throw new Error("User not authenticated");
    }

    const userId = req.user.id || req.user._id;

    // Find order
    const order = await Order.findById(orderId);
    if (!order || order.userId.toString() !== userId?.toString()) {
      res.status(404);
      throw new Error("Order not found or not authorized");
    }

    if (order.paymentStatus === "paid") {
      res.status(400);
      throw new Error("Payment already completed for this order");
    }

    // Handle COD
    if (method === "COD") {
      const payment = new Payment({
        orderId,
        userId,
        amount: order.totalAmount,
        status: "success",
        method: "COD",
      });

      await payment.save();

      order.paymentStatus = "paid";
      await order.save();

       sendSuccessResponse(res, 200, "COD payment recorded", payment);
       return
    }

    // Handle Online Payment (Razorpay)
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: order.totalAmount * 100, // Amount in paise
        currency: "INR",
        receipt: orderId,
      });
    } catch (err: any) {
      console.error("Razorpay order creation failed:", err);
      res.status(500);
      throw new Error("Failed to initiate Razorpay payment");
    }

    const payment = new Payment({
      orderId,
      userId,
      amount: order.totalAmount,
      paymentId: razorpayOrder.id,
      status: "pending",
      method: method || "card",
    });

    await payment.save();

     sendSuccessResponse(res, 200, "Payment initiated", {
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount * 100,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order._id,
    });
    return
  } catch (err: any) {
    console.error("processPayment error:", err);

    // Safe fallback error response
    const message =
      err?.response?.data?.message || err.message || "Internal Server Error";

    res.status(err?.response?.status || res.statusCode || 500).json({
      success: false,
      message,
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});



export const verifyPayment = asyncHandler(async (req: AuthRequest, res) => {
  const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

  // Validate user
  if (!req.user || (!req.user.id && !req.user._id)) {
    res.status(401);
    throw new Error("User not authenticated");
  }
  const userId = req.user.id || req.user._id;

  // Validate orderId format
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    res.status(400);
    throw new Error("Invalid order ID format");
  }

  // Find order with populated item details
  const order = await Order.findById(orderId).populate("items.itemId") as IOrder | null;
  if (!order || order.userId.toString() !== userId?.toString()) {
    res.status(404);
    throw new Error("Order not found or not authorized");
  }

  // Find payment
  const payment = await Payment.findOne({ orderId, paymentId: razorpayOrderId });
  if (!payment || payment.status !== "pending") {
    res.status(400);
    throw new Error("Invalid payment or already processed");
  }

  // Verify Razorpay signature
  if (!process.env.RAZORPAY_KEY_SECRET) {
    res.status(500);
    throw new Error("Razorpay key secret not configured");
  }
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    payment.status = "failed";
    await payment.save();
    order.paymentStatus = "failed";
    await order.save();
    res.status(400);
    throw new Error("Payment verification failed");
  }

  // Update payment
  payment.paymentId = razorpayPaymentId;
  payment.status = "success";
  await payment.save();

  // Update order
  order.paymentStatus = "paid";
  await order.save();

  // Notify restaurants
  try {
    const restaurantIds = Array.isArray(order?.restaurantId)
      ? order?.restaurantId
      : [order?.restaurantId];
    const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } }) as IRestaurant[];

    const itemsByRestaurant: Record<string, any[]> = {};
    order.items.forEach((item: any) => {
      const restaurantId = item?.restaurantId?.toString();
      if (!itemsByRestaurant[restaurantId]) {
        itemsByRestaurant[restaurantId] = [];
      }
      itemsByRestaurant[restaurantId].push(item);
    });

    for (const restaurant of restaurants) {
      const restaurantItems = itemsByRestaurant[restaurant._id.toString()] || [];
      if (restaurantItems.length > 0) { // Only notify if there are items
        await sendRestaurantNotification({
          restaurant,
          orderId: order._id,
          items: restaurantItems,
          totalAmount: restaurantItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
          deliveryAddress: order.deliveryAddress,
          contactNumber: order.contactNumber,
        });
      }
    }
  } catch (notificationError) {
    console.error("Failed to send restaurant notifications:", notificationError);
  }

  sendSuccessResponse(res, 200, "Payment verified successfully", payment);
});