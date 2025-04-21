import type{ Request, Response, NextFunction } from "express";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `🔍 Route '${req.originalUrl}' not found!`,
  });
};

export default notFound;
