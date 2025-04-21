import type{ Request, Response, NextFunction } from "express";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 Error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
};

export default errorHandler;
