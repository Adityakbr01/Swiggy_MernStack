import mongoose, { Document, Schema } from "mongoose";
import bcrypt from 'bcrypt';

interface IAddress {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    location: {
        type: "Point";
        coordinates: [number, number]; 
    };
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    address: IAddress[];
    profileImage: string;
    phone_number?: string;
    role: "admin" | "customer" | "restaurant" | "rider";
    reset_otp?: number;
    OWN_Restaurant?: mongoose.Types.ObjectId | null;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const addressSchema = new Schema<IAddress>({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true },
    location: {
        type: {
            type: String,
            enum: ["Point"], 
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: function (coords: number[]) {
                    return coords.length === 2;
                },
                message: "Coordinates must have exactly [longitude, latitude]",
            },
        },
    },
});

// User Schema
const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        address: {
            type: [addressSchema], 
            default: [],
        },
        profileImage: {
            type: String,
            default: "",
        },
        phone_number: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            enum: ["admin", "customer", "restaurant", "rider"],
            default: "customer",
        },
        reset_otp: {
            type: Number,
            default: null,
        },
        OWN_Restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            default: null,
        },
    },
    { timestamps: true }
);

userSchema.methods.comparePassword = async function (candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Indexes
userSchema.index({ email: 1 }); 
userSchema.index({ role: 1 });
userSchema.index({ "address.location": "2dsphere" });

// Model Export
const User = mongoose.model<IUser>("User", userSchema);
export default User;
