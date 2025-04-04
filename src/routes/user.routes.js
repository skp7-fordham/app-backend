import { Router } from "express";
import { registerUser,loginUser,logOutUser,refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import pkg from 'jsonwebtoken';  
const { Jwt } = pkg;
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverimage",
            maxCount:1
        }
    ]),
    registerUser)

    router.route("/login").post(loginUser)
    router.route("/logout").post(verifyJWT,logOutUser)
    router.route("/refresh-token").post(refreshAccessToken)


export default router