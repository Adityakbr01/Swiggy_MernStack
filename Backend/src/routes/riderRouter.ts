import express from "express";
import {
  getAvailableRiders,
  assignRiderToOrder,
  updateRiderLocation,
  getRiderOrders,
  acceptOrder,
  updateOrderStatus,
  getAllOrdersForRider,
} from "@/controllers/riderController";
import { protect } from "@/middlewares/authMiddleware"; // Placeholder for your auth middleware
import { logger } from "@/utils/logger"; // Assuming logger utility

const router = express.Router();

// Middleware to log requests
router.use((req, res, next) => {
  logger.info(`Rider route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// Get available riders (restaurant/admin)
router.get("/available", protect, getAvailableRiders);

// Assign rider to order (restaurant/admin)
router.post("/orders/:orderId/assign", protect, assignRiderToOrder);

// Update rider location (rider)
router.post("/location", protect, updateRiderLocation);

// Get rider's orders (rider)
router.get("/orders", protect, getRiderOrders);

// Accept an order (rider)
router.post("/orders/:orderId/accept", protect, acceptOrder);

// Update order status (rider)
router.patch("/orders/:orderId/status", protect, updateOrderStatus);

// Get all orders for a rider (rider)
router.get("/Allorders", protect, getAllOrdersForRider);

export default router;