import type { Response } from "express";

export const sendErrorResponse = (
    res: Response,
    statusCode: number = 500,
    message: string = "Internal Server Error",
    error?: any
): Response => {
    const response: { success: boolean; message: string; error?: string } = {
        success: false,
        message,
    };

    if (error && process.env.NODE_ENV === "development") {
        response.error = error.stack || String(error);
    }

    return res.status(statusCode).json(response);
};


export const sendSuccessResponse = <T>(
    res: Response,
    statusCode: number = 200,
    message: string = "Success",
    data?: T
): Response => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};