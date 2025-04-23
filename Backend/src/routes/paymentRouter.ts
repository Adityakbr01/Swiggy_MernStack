// routes/paymentRouter.js
import express from "express";
import { processPayment, verifyPayment } from "@controllers/paymentController";
import { protect, restrictTo } from "@middlewares/authMiddleware";

const paymentRouter = express.Router();

// Payment routes
paymentRouter.post("/:orderId/payment",
  protect,
  restrictTo("customer"),
  processPayment
)

// Payment verification route
paymentRouter.post("/verify",
  protect,
  restrictTo("customer"),
  verifyPayment
)

export default paymentRouter;