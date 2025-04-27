// @models/Rider.js
import mongoose, { Document, Schema } from "mongoose";

interface IRider extends Document {
  userId: mongoose.Types.ObjectId;
  currentLocation: { type: "Point"; coordinates: [number, number] };
  status: "available" | "busy" | "offline";
  assignedOrders: mongoose.Types.ObjectId[];
  lastUpdated: Date;
}

const riderSchema = new Schema<IRider>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currentLocation: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true },
    },
    status: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },
    assignedOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
riderSchema.index({ userId: 1 }, { unique: true });
riderSchema.index({ "currentLocation": "2dsphere" });
riderSchema.index({ status: 1 });

const Rider = mongoose.model<IRider>("Rider", riderSchema);
export default Rider;