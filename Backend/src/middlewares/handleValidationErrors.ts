import { deleteLocalFile, deleteMediaCloudinary } from "@utils/multerConfig";
import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const handleValidationErrors = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        
        res.status(400).json({ success: false, errors: errors.array() });
        console.log(req.files || req.file);
        if (req.files || req.file) {

            
            let filePath: string | undefined;
            if (req.file) {
                filePath = req.file.path;
              
            } else if (Array.isArray(req.files) && req.files.length > 0) {
                filePath = req?.files[0]?.path;
                return
            }

            if (filePath) {
                deleteLocalFile(filePath);
            deleteMediaCloudinary(filePath);
            }
        }
        return
    }

    next();
};
