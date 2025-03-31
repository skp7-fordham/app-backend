import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/Apiresponse.js";

const registerUser = asyncHandler( async (req,res) =>{
    const {email,fullname,username,password}=req.body //destructuring req.body object
    console.log("email:",email)

    if([email,fullname,username,password].some((field)=> field?.trim()==="")){
          throw new ApiError(400,"All fields required")
    }

   const existedUser= User.findOne({
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

  


export {registerUser}