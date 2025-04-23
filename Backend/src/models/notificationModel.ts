// @models/notificationModel.ts
import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["new_order", "order_update", "other"],
    default: "new_order",
  },
  status: {
    type: String,
    enum: ["unread", "read"],
    default: "unread",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Notification", notificationSchema);