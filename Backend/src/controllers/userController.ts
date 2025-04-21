import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendErrorResponse, sendSuccessResponse } from "@utils/responseUtil";
import User, { type IUser } from "@models/userModel";
import { _config } from "@config/_config";
import { deleteLocalFile, deleteMediaCloudinary } from "@utils/multerConfig";
import { Result } from "express-validator";
import { getCache, setCache, deleteCache } from '../utils/redisUtils';


// @desc    Create a new user
// @route   POST /api/v1/users/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {

    try {
        const { name, email, password, phone_number, role, address } = req.body;
        const profileImageUrl = req?.file?.path;

     

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            sendErrorResponse(res, 400, "Email already registered");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

 
       if(role){
        if ((role.toString().toLowerCase() === "rider" || role.toString().toLowerCase() === "restaurant") && !phone_number) {
          sendErrorResponse(res, 400, "Phone number is required for rider and restaurant roles");
          return;
      }
       }

        if (!Array.isArray(address) || address.length === 0) {
            sendErrorResponse(res, 400, "Address is required and must be an array");
            return;
        }

        for (const addr of address) {
            if (!addr || !addr.location || !Array.isArray(addr.location.coordinates) || addr.location.coordinates.length !== 2) {
                sendErrorResponse(res, 400, "Invalid address or GeoJSON coordinates");
                return;
            }
        }


        const newUser: IUser = new User({
            name,
            email,
            password: hashedPassword,
            phone_number,
            role,
            address,
            profileImage:profileImageUrl ? profileImageUrl : "",
        });

        await newUser.save();
    
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, _config.JWT_SECRET as string, { expiresIn: "7d" });

            // Set token in cookie
            res.cookie("token", token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
          });

        sendSuccessResponse(res, 201, "User registered successfully", { user: newUser, token });

    } catch (error) {
        deleteLocalFile(req?.file?.path as string);
        console.error("Registration Error:", error);
        sendErrorResponse(res, 500, "Internal Server Error");
    }
};

// @desc    Login a user
// @route   POST /api/v1/users/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            sendErrorResponse(res, 401, "Invalid email or password");
            return;
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            sendErrorResponse(res, 401, "Invalid email or password");
            return;
        }

        const token = jwt.sign({ id: user._id, role: user.role }, _config.JWT_SECRET as string, { expiresIn: "7d" });
        
        // Store in cache for future requests (cache for 5 minutes) - but don't block if Redis fails
        const userData = user.toObject({ getters: true });
        setCache(`user:${user._id}`, userData, 300).catch(() => {
            // Silently continue if cache fails
        });

        // Set token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        sendSuccessResponse(res, 200, "Login successful", { user: userData, token });
    } catch (error) {
        console.error("Login Error:", error);
        sendErrorResponse(res, 500, "Internal Server Error");
    }
};

// @desc    Logout a user
// @route   POST /api/v1/users/logout
// @access  Private
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie("token");
        sendSuccessResponse(res, 200, "Logout successful");
    } catch (error) {
        console.error("Logout Error:", error);
        sendErrorResponse(res, 500, "Internal Server Error");
    }
};

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
// For caching user profiles:
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Try to get user from cache first
    const cacheKey = `user:${req.user.id}`;
    let cachedUser = null;
    
    try {
      cachedUser = await getCache<any>(cacheKey);
    } catch (error) {
      // Silently continue if cache retrieval fails
    }
    
    if (cachedUser) {
      // If found in cache, return it
      sendSuccessResponse(res, 200, "User profile retrieved from cache", { user: cachedUser });
      return;
    }
    
    // If not in cache, get from database
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      sendErrorResponse(res, 404, "User not found");
      return;
    }
    
    // Store in cache for future requests (cache for 15 minutes)
    const userData = user.toObject({ getters: true });
    setCache(cacheKey, userData, 900).catch(() => {
      // Silently continue if cache fails
    }); 
    
    sendSuccessResponse(res, 200, "User profile retrieved successfully", { user: userData });
  } catch (error) {
    console.error("Get User Profile Error:", error);
    sendErrorResponse(res, 500, "Internal Server Error");
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone_number, address } = req.body;
    const profileImageUrl = req?.file?.path;
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      sendErrorResponse(res, 404, "User not found");
      return;
    }
    
    if (profileImageUrl && user.profileImage) {
      // Delete old image from Cloudinary
      await deleteMediaCloudinary(user.profileImage);  
    }
    
    user.name = name || user.name;
    user.phone_number = phone_number || user.phone_number;
    user.address = address || user.address;
    user.profileImage = profileImageUrl || user.profileImage;
    
    await user.save();
    
    // Update cache but don't block if it fails
    const cacheKey = `user:${req.user.id}`;
    setCache(cacheKey, user.toObject({ getters: true }), 900).catch(() => {
      // Silently continue if cache fails
    });
    
    sendSuccessResponse(res, 200, "User profile updated successfully", { user: user.toObject({ getters: true }) });
  } catch (error) {
    console.error("Update User Profile Error:", error);
    sendErrorResponse(res, 500, "Internal Server Error");
  }
};

// @desc    Delete user profile
// @route   DELETE /api/v1/users/profile
// @access  Private
export const deleteUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      sendErrorResponse(res, 404, "User not found");
      return;
    }
    
    // Delete cache but don't block if it fails
    const cacheKey = `user:${req.user.id}`;
    deleteCache(cacheKey).catch(() => {
      // Silently continue if cache fails
    });
    
    sendSuccessResponse(res, 200, "User profile deleted successfully");
  } catch (error) {
    console.error("Delete User Profile Error:", error);
    sendErrorResponse(res, 500, "Internal Server Error");
  }
};
