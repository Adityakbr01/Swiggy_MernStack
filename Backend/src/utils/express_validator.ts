import type { Request,Response,NextFunction } from "express";
import { body } from "express-validator";

// Middleware to parse address JSON
const parseAddressMiddleware = (req:Request, res:Response, next:NextFunction) => {
    if (typeof req.body.address === "string") {
        try {
            req.body.address = JSON.parse(req.body.address);
        } catch (error) {
             res.status(400).json({ success: false, message: "Invalid JSON format for address" });
             return
        }
    }
    next();
};

// Validation Middleware
export const registerValidator = [
    parseAddressMiddleware,  // Add this first to parse the address

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters long"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),

    body("role")
        .optional()
        .isIn(["admin", "customer", "restaurant", "rider"])
        .withMessage("Invalid role selected"),

    // Conditional validation for phone_number
    body("phone_number").custom((value, { req }) => {
        if (req.body.role === "rider" || req.body.role === "restaurant") {
            if (!value) {
                throw new Error("Phone number is required for rider and restaurant roles");
            }
            if (!/^\d{10}$/.test(value)) {
                throw new Error("Phone number must be exactly 10 digits");
            }
        }
        return true;
    }),

    body("address").custom((value) => {
        let addressArray;
        if (typeof value === "string") {
            try {
                addressArray = JSON.parse(value);
            } catch (error) {
                throw new Error("Invalid JSON format for address");
            }
        } else {
            addressArray = value;
        }

        if (!Array.isArray(addressArray) || addressArray.length === 0) {
            throw new Error("At least one address is required");
        }
        return true;
    }),

    body("address.*.street").notEmpty().withMessage("Street is required"),
    body("address.*.city").notEmpty().withMessage("City is required"),
    body("address.*.state").notEmpty().withMessage("State is required"),
    body("address.*.country").notEmpty().withMessage("Country is required"),
    body("address.*.pincode")
        .notEmpty()
        .withMessage("Pincode is required")
        .isNumeric()
        .withMessage("Pincode must be a number")
        .isLength({ min: 6, max: 6 })
        .withMessage("Pincode must be exactly 6 digits"),

    body("address.*.location.type")
        .equals("Point")
        .withMessage("Location type must be 'Point'"),

    body("address.*.location.coordinates")
        .isArray({ min: 2, max: 2 })
        .withMessage("Coordinates must be an array with [longitude, latitude]")
        .custom((coords) => {
            if (
                typeof coords[0] !== "number" ||
                typeof coords[1] !== "number"
            ) {
                throw new Error("Coordinates must contain numbers only");
            }
            return true;
        }),
];

export const loginValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),
];

// Restaurant Validator
export const restaurantValidator = [
  // Name validation
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Restaurant name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Restaurant name must be between 3 and 100 characters"),

  // Location validation
  body("location.street")
    .trim()
    .notEmpty()
    .withMessage("Street address is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Street must be between 5 and 200 characters"),

  body("location.city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),

  body("location.state")
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters"),

  body("location.country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),

  body("location.pincode")
    .trim()
    .notEmpty()
    .withMessage("Pincode is required")
    .matches(/^\d{6}$/)
    .withMessage("Pincode must be a 6-digit number"), // India-specific, adjust if needed

  body("location.coordinates")
    .isObject()
    .withMessage("Coordinates must be an object of [longitude, latitude]"),
  body("location.coordinates.type")
    .equals("Point")
    .withMessage("Location type must be 'Point'"),
  body("location.coordinates.coordinates")
    .isArray({ min: 2, max: 2 })
    .withMessage("Coordinates must be an array of [longitude, latitude]"),
  body("location.coordinates.coordinates[0]")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("location.coordinates.coordinates[1]")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
];

// Menu Item Validator
export const menuItemValidator = [
  // Item Name validation
  body("itemName")
    .trim()
    .notEmpty()
    .withMessage("Item name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Item name must be between 2 and 50 characters"),

  // Price validation
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 1 })
    .withMessage("Price must be a positive number greater than 1")
    .toFloat(), // Convert to float

  // Description validation (optional)
  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description must not exceed 200 characters"),

  // Category validation (optional)
  body("category")
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("Category must be between 2 and 30 characters"),
];

// Order validation rules
export const orderValidator = [
  // Customer details
  body('customerId').optional(),
  
  // Restaurant details
  body('restaurantId').optional(),
  
  // Delivery address
  body('deliveryAddress').isObject().withMessage('Delivery address must be an object'),
  body('deliveryAddress.street').notEmpty().withMessage('Street is required'),
  body('deliveryAddress.city').notEmpty().withMessage('City is required'),
  body('deliveryAddress.state').notEmpty().withMessage('State is required'),
  body('deliveryAddress.country').notEmpty().withMessage('Country is required'),
  body('deliveryAddress.pincode').notEmpty().withMessage('Pincode is required'),
  
  // Items array
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.itemId').notEmpty().withMessage('Item ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  
  // Payment details
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('paymentMethod').isIn(['cash', 'card', 'razorpay']).withMessage('Invalid payment method'),
  
  // Optional notes
  body('notes').optional().isString().withMessage('Notes must be a string'),
  
  // Order type
  body('orderType').optional().isIn(['delivery', 'pickup']).withMessage('Invalid order type'),
  
  // Contact number
  body('contactNumber').notEmpty().withMessage('Contact number is required'),
  body('contactNumber').isMobilePhone('en-IN').withMessage('Invalid Indian mobile number'),
];


export { parseAddressMiddleware };
