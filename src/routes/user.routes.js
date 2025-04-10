import { Router } from "express";
import { registerUser,loginUser,logOutUser,refreshAccessToken,
          changePassword,currentuser,updateaccount,userAvatarUpdate,
          userCoverimgUpdate,getUserchannelProfile,getWatchHisotry } from "../controllers/user.controller.js";
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
    router.route("/change-password").post(verifyJWT,changePassword)
    router.route("/current-user").get(verifyJWT,currentuser)
    router.route("/update-account").patch(verifyJWT,updateaccount)
    router.route("/avatar").patch(verifyJWT,upload.single("avatar"),userAvatarUpdate)
    router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),userCoverimgUpdate)
    router.route("/c/:username").get(verifyJWT,getUserchannelProfile)
    router.route("/history").get(verifyJWT,getWatchHisotry)





export default router