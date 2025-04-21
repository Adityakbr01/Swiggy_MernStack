import { deleteUserProfile, getUserProfile, loginUser, logoutUser, registerUser, updateUserProfile } from "@controllers/userController"
import { protect } from "@middlewares/authMiddleware"
import { handleValidationErrors } from "@middlewares/handleValidationErrors"
import { loginValidator, parseAddressMiddleware, registerValidator } from "@utils/express_validator"
import { upload } from "@utils/multerConfig"
import express from "express"

const userRouter = express.Router()

userRouter.get("/test", (req, res) => {
    res.send("User Routse active")
})

userRouter.post("/register", upload.single("profileImage"), registerValidator,handleValidationErrors, registerUser)
userRouter.post("/login",loginValidator,handleValidationErrors, loginUser)
userRouter.post("/logout", protect, logoutUser);
userRouter.get("/profile", protect, getUserProfile);
userRouter.put("/profile",upload.single("profileImage"), protect, updateUserProfile);
userRouter.delete("/profile", protect, deleteUserProfile);

export default userRouter