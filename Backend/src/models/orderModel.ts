// @models/Order.js
import mongoose, { Document, Schema } from "mongoose";

export interface IOrderItem {
  itemName?: string;
  itemId: mongoose.Types.ObjectId;
  price: number;
  quantity: number;
  restaurantId: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    coordinates: { type: "Point"; coordinates: [number, number] };
  };
  status: string;
  riderId?: mongoose.Types.ObjectId;
  paymentStatus: string;
  contactNumber: string;
  createdAt: Date;
  updatedAt: Date;
  deliveryFee?: number;
}

const orderItemSchema = new Schema<IOrderItem>({
  itemName: { type: String, required: false },
  itemId: { type: Schema.Types.ObjectId, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
});

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      pincode: { type: String, required: true },
      coordinates: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true },
      },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "preparing", "assigned", "out-for-delivery", "delivered", "cancelled"],
      default: "pending",
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    contactNumber: {
      type: String,
      required: true,
    },
    deliveryFee: {
      required: false,
      type: Number,
      default: 20,
    },
  },
  { timestamps: true }
);

// Indexes
orderSchema.index({ userId: 1 });
orderSchema.index({ restaurantId: 1 });
orderSchema.index({ riderId: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;