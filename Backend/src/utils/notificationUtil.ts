// @utils/notificationUtil.ts
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import Notification from "@models/notificationModel";
import User from "@models/userModel";
import type { IRestaurant } from "@models/restaurantModel";
import { _config } from "@config/_config";

interface NotificationData {
  restaurant: IRestaurant;
  orderId: mongoose.Types.ObjectId;
  items: {
    itemId: { itemName: string; price: number };
    quantity: number;
    price: number;
    restaurantId: mongoose.Types.ObjectId;
  }[];
  totalAmount: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    coordinates: { type: string; coordinates: [number, number] };
  };
  contactNumber: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: _config.SMTP_USER || process.env.SMTP_USER,
    pass: _config.SMTP_PASS || process.env.SMTP_PASS,
  },
});

export const sendRestaurantNotification = async (data: NotificationData) => {
  const { restaurant, orderId, items, totalAmount, deliveryAddress, contactNumber } = data;

  // Fetch owner email if restaurant.email is not available
  let email = restaurant.email;
  if (!email && restaurant.ownerId) {
    const owner = await User.findById(restaurant.ownerId).select("email");
    email = owner?.email!;
  }

  // Email Notification
  if (email) {
    try {
      const emailContent = `
        New Order Received (#${orderId})
        
        Dear ${restaurant.name},
        
        You have a new order with the following details:
        
        Items:
        ${items
          .map(
            (item) =>
              `- ${item.itemId?.itemName || "Item"} (Qty: ${item.quantity}, Price: ₹${item.price})`
          )
          .join("\n")}
        
        Total Amount: ₹${totalAmount.toFixed(2)}
        Delivery Address: ${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state}, ${deliveryAddress.pincode}
        Customer Contact: ${contactNumber}
        
        Please prepare the order for delivery.
        
        Regards,
        Food App Team
      `;

      await transporter.sendMail({
        from: `"Food App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `New Order #${orderId}`,
        text: emailContent,
      });
      console.log(`Email sent to ${email} for order ${orderId}`);
    } catch (emailError) {
      console.error(`Failed to send email to ${email}:`, emailError);
    }
  }

  // In-App Notification
  try {
    await Notification.create({
      restaurantId: restaurant._id,
      orderId,
      message: `New order #${orderId} received with ${items.length} item(s) for ₹${totalAmount.toFixed(2)}.`,
      type: "new_order",
      status: "unread",
      createdAt: new Date(),
    });
    console.log(`In-app notification created for restaurant ${restaurant._id}`);
  } catch (notificationError) {
    console.error(`Failed to create in-app notification for ${restaurant._id}:`, notificationError);
  }
};