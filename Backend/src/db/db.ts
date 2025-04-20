import mongoose from "mongoose";
import dotenv from "dotenv";
import { _config } from "@config/_config";
import { logger } from "@utils/logger";

dotenv.config();

const MONGO_URI = _config.MONGO_URI

const connectDB = async () => {
    try {
      // Attempt to connect to MongoDB
      await mongoose.connect(MONGO_URI);
      logger.info('MongoDB Connected successfully');
    } catch (error) {
      if (error instanceof Error) {
          logger.error(`MongoDB connection failed: ${error.message}`);
        } else {
          // If error is not an instance of Error, log a generic message
          logger.error('Unknown error occurred during MongoDB connection.');
        }
      process.exit(1); // Exit the process if MongoDB connection fails
    }
  };

export default connectDB;
