import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import  Apiresponse  from "../utils/Apiresponse.js";
import jwt from 'jsonwebtoken';


const AccessAndRefreshTokens = async (userId)=>{
     try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accesstoken = user.generateAccessToken()
       const refreshtoken = user.generateRefreshToken()
       user.refreshtoken=refreshtoken
       await user.save({ validateBeforeSave: false })
       return {accesstoken,refreshtoken}
     } catch (error) {
        throw new ApiError(500,"Something went wrong")
     }
}


const registerUser = asyncHandler( async (req,res) =>{
    const {email,fullname,username,password}=req.body //destructuring req.body object
    console.log("email:",email)

    if([email,fullname,username,password].some((field)=> field?.trim()==="")){
          throw new ApiError(400,"All fields required")
    }

   const existedUser= await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new ApiError("409","User already exists")
    }

    const avatarLocalPath= req.files?.avatar[0]?.path   //avatar is a field that can contain many files so refering to first one 
    const coverimagePath=req.files?.coverimage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar required")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath);
  const coverimage=await uploadOnCloudinary(coverimagePath);

  if(!avatar){
    throw new ApiError(400,"Avatar required")
  }

   const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverimage : coverimage?.url || "",
        email,
        password,
        username
   })

   const checkuser= await User.findById(user._id).select("-password -refreshtoken")

   if(!checkuser){
      throw new ApiError(500,"Something went wrong")
   }

  return res.status(201).json(new Apiresponse(200,checkuser,"Registered Successfully"))
})

const loginUser = asyncHandler(async (req,res)=>{
      const {username,email,password}=req.body
      if(!username){
        throw new ApiError(400,"Username required")
      }

     const user = await User.findOne({username}) //returns user obj with all fields
     if(!user){
         throw new ApiError(404,"User does not exist")
     }

   const ispasswordvalid =  await user.isPasswordCorrect(password) //bcrypt method in user.models
      
     if(!ispasswordvalid){
        throw new ApiError(404,"Invalid password")
     }

     const {accesstoken,refreshtoken} = await AccessAndRefreshTokens(user._id)
     
    const loggedInUser = await User.findById(user._id).select("-password -refreshtoken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200).cookie("accesstoken",accesstoken,options).cookie("refreshtoken",refreshtoken,options).json(
        new Apiresponse(
            200,
            {
                user : loggedInUser,accesstoken,refreshtoken
            },
            "Logged in successfully"
        )
    )
})

const logOutUser = asyncHandler(async (req,res)=>{
     await User.findByIdAndUpdate(
        req.user._id,
        {
            $set :{
                refreshtoken:undefined
            }
        },
        {
            new:true
        }
      )

      const options={
        httpOnly:true,
        secure:true
    }
     
    return res
    .status(200)
    .clearCookie("accesstoken",options)
    .clearCookie("refreshtoken",options)
    .json(new Apiresponse(200,{},"User logged out"))
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingrefreshtoken = req.cookies.refreshtoken || req.body.refreshtoken

    if(!incomingrefreshtoken){
        throw new ApiError(401,"Unauthorise request")
    }

    try {
        const decodedtoken = jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedtoken?._id)
        if(!user){
            throw new ApiError(401,"Invalid token")
        }
    
        if(incomingrefreshtoken !== user?.refreshtoken){
            throw new ApiError(401,"Expired token")
        }
          
        const options={
            httpOnly:true,
            secure:true
        }
    
       const {accesstoken,newrefreshtoken} = await AccessAndRefreshTokens(user._id)
        return res.status(200).cookie("accesstoken",accesstoken,options).cookie("refreshtoken",newrefreshtoken,options).json(
            new Apiresponse(
                200,
                {
                   accesstoken,
                   refreshtoken : newrefreshtoken
                }
            )
        )
    } catch (error) {
        throw new ApiError(400,"Invalid refresh token")
    }

})


export {registerUser,loginUser,logOutUser,refreshAccessToken}


