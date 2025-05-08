// @models/Restaurant.js
import mongoose, { Document, Schema } from "mongoose";

interface IMenuItem {
  _id?: mongoose.Types.ObjectId;
  itemName: string;
  price: number;
  description?: string;
  category?: string;
  imageUrl?: string;
}

export enum CuisineType {
  MAIN_COURSE = "Main Course",
  RICE_BIRYANI = "Rice & Biryani",
  ITALIAN = "Italian",
  CHINESE = "Chinese",
  MEXICAN = "Mexican",
  INDIAN = "Indian",
  FAST_FOOD = "Fast Food",
}

export interface IRestaurant extends Document {
  ownerId: mongoose.Types.ObjectId;
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  location: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    coordinates: { type: "Point"; coordinates: [number, number] };
  };
  cuisines: CuisineType[];
  menu: IMenuItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  restaurantImage?: string;
  deliveryTime?: number;
  deliveryFee?: number;
  rating?: number;
  orders: mongoose.Types.ObjectId[];
}

const menuItemSchema = new Schema<IMenuItem>({
  
  itemName: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  imageUrl: { type: String },
});

const restaurantSchema = new Schema<IRestaurant>(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    restaurantImage: { type: String },
    location: {
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
    cuisines: [{ type: String, enum: Object.values(CuisineType) }],
    menu: [menuItemSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    deliveryFee: { type: Number, default: 0 },
    deliveryTime: { type: Number, default: 30 },
    rating: { type: Number, default: 0 },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ]
  },
  { timestamps: true }
);

// Indexes
restaurantSchema.index({ ownerId: 1 });
// restaurantSchema.index({ "location.coordinates": "2dsphere" });

const Restaurant = mongoose.model<IRestaurant>("Restaurant", restaurantSchema);
export default Restaurant;