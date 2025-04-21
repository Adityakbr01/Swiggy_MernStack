// routes/restaurantRouter.js
import express from "express";
import { 
  createRestaurant, 
  getRestaurants, 
  getRestaurantById, 
  updateRestaurant, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem, 
  deleteRestaurant,
  getMenuItem,
  getNearbyRestaurants,
  getMenus
} from "@controllers/restaurantController";
import { protect, restrictTo } from "@middlewares/authMiddleware";
import { restaurantValidator, menuItemValidator, parseAddressMiddleware } from "@utils/express_validator";
import { handleValidationErrors } from "@middlewares/handleValidationErrors";
import { upload } from "@utils/multerConfig";

const restaurantRouter = express.Router();

// Public routes
restaurantRouter.get("/nearby", protect, getNearbyRestaurants);
restaurantRouter.get("/", getRestaurants); // All restaurants list
restaurantRouter.get("/:id", getRestaurantById); // Single restaurant details

// Protected routes (restaurant owner only)
restaurantRouter.post(
  "/", 
  protect, 
  restrictTo("restaurant"),
  upload.single("restaurantImage"), 
  parseAddressMiddleware,
  restaurantValidator, 
  handleValidationErrors, 
  createRestaurant
);
restaurantRouter.put(
  "/:id", 
  protect, 
  restrictTo("restaurant"),
  upload.single("restaurantImage"), 
  restaurantValidator, 
  handleValidationErrors, 
  updateRestaurant
);
restaurantRouter.delete(
  "/:id", 
  protect, 
  restrictTo("restaurant"), 
  deleteRestaurant
);

// Menu management
restaurantRouter.post(
  "/:id/menu", 
  protect, 
  restrictTo("restaurant"),
  upload.single("itemImage"), 
  menuItemValidator, 
  handleValidationErrors, 
  addMenuItem
);
restaurantRouter.get(
  "/:id/menu/:itemId", 
  getMenuItem
);

// Get all menus
restaurantRouter.get(
  "/:id/menu", 
  getMenus
);
restaurantRouter.put(
  "/:id/menu/:itemId", 
  protect,
  restrictTo("restaurant"), 
  upload.single("itemImage"), 
  menuItemValidator, 
  handleValidationErrors, 
  updateMenuItem
);
restaurantRouter.delete("/:id/menu/:itemId", protect, restrictTo("restaurant"), deleteMenuItem);




export default restaurantRouter;