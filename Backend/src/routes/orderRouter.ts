// routes/orderRouter.js
import express from "express";
import { 
  createOrder, 
  getOrderById, 
  getUserOrders, 
  updateOrderStatus, 
  cancelOrder, 
  getRestaurantOrders,
  getPaidOrders,
  
  availableOrders
} from "@controllers/orderController";
import { protect, restrictTo } from "@middlewares/authMiddleware";
import { orderValidator, parseAddressMiddleware } from "@utils/express_validator";
import { handleValidationErrors } from "@middlewares/handleValidationErrors";

const orderRouter = express.Router();

// Place a new order (Customer only)
orderRouter.post(
  "/",
  protect,
  restrictTo("customer"),
  parseAddressMiddleware,
  orderValidator,
  handleValidationErrors,
  createOrder
);


orderRouter.get("/availableOrders", availableOrders);
// Get all orders for a restaurant (Restaurant owner only)
orderRouter.get("/paidOrders", protect, restrictTo("restaurant","admin","rider"), getPaidOrders);


orderRouter.get(
  "/:id/orders",
  protect,
  restrictTo("restaurant"),
  getRestaurantOrders
);
orderRouter.get("/my-orders", protect, getUserOrders);
orderRouter.put("/:id/status", protect, restrictTo("restaurant", "rider"), updateOrderStatus);
orderRouter.get("/:id", protect,restrictTo("customer", "restaurant"), getOrderById); // Track specific order
orderRouter.delete("/:id", protect, cancelOrder); // Cancel order



export default orderRouter;


