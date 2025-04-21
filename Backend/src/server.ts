import express from "express";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import cookieParser from "cookie-parser";
import notFound from "./middlewares/notFound";
import errorHandler from "./middlewares/errorHandler";
import userRouter from "./routes/userRouter";
import restaurantRouter from "./routes/restaurantRouter";

const app = express();





// ✅ Middleware Setup
// Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 500, // 100 requests per windowMs per IP
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again after 15 minutes" }
});


// Apply general security middleware
app.disable('x-powered-by'); 
app.use(limiter);


// Body parsers
app.use(express.json({limit: '24kb'})); // Parse JSON request body
app.use(express.urlencoded({ extended: true, limit: '24kb' })); // Parse URL-encoded data
app.use(cookieParser()); // Parse Cookie header and populate req.cookies


// CORS with proper configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    maxAge: 86400 // Cache preflight requests for 1 day (in seconds)
}));



// Set some performance headers for all responses
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Test root Route
app.get("/", (req, res) => {
    res.send("Server is running!");
  });

// API Routes
app.use("/api/v1/users/", userRouter);  
app.use("/api/v1/restaurants", restaurantRouter);


// Error Handling Middleware
app.use(notFound); 
app.use(errorHandler);
 

export default app;