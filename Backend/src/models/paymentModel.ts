// @models/Payment.js
import mongoose, { Document, Schema } from "mongoose";

interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  paymentId: string;
  status: "pending" | "success" | "failed";
  method: "UPI" | "card" | "COD" | "razorpay";
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String, // Razorpay payment ID
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    method: {
      type: String,
      enum: ["UPI", "card", "COD", "razorpay"],
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
export default Payment;