import { asyncHandler } from "../util/asyncHandler.js";
import {ApiError} from "../util/ApiError.js"
import {User} from "../models/User.models.js"
import { ApiResponse } from "../util/ApiResponse.js";

const generateTokens = async (userId) =>{
  try {
    const user =await User.findById(userId)
    if(!user){
      throw new ApiError(402,"User not found")
    }
  
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
  
    await user.save({validateBeforeSave:false})
    return {accessToken,refreshToken}
  } catch (error) {
    console.log(error);
  }
}

const registerUser = asyncHandler(async (req,res) =>{
  const {userName,email,password} = req.body

  //validation
  if([userName,email,password].some((feild) => feild?.trim()==="")){
    throw new ApiError(400,"All feilds required")
  }
  const existingUser =await User.findOne({
    $or: [{userName},{email}]
  })
  if(existingUser){
    throw new ApiError(400,"User already exists")
  }
  const user =await User.create({
    userName,email,password
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if(!createdUser){
    throw new ApiError(400,"SOmething went wrong in creating user")
  }

  return res.status(201)
            .json(new ApiResponse(201,createdUser,"User Registered Successfully"))
})

const loginUser = asyncHandler(async (req,res) => {
  const {email,password} = req.body
  if(!email){
    throw new ApiError(401,"Please enter email")
  }

  const user = await User.findOne({
    email
  })
  if(!user){
    throw new ApiError(400,"User not found")
  }
  //validation
  const passwordCorrect = await user.isPasswordCorrect(password)
  if(!passwordCorrect){
    throw new ApiError(401,"Invalid Credentials")
  }
  const {accessToken,refreshToken} = await generateTokens(user._id)

  const loggedUser = await User.findById(user._id)
    .select("-password -refreshToken");
  
  const options = {
    httpOnly:true,
    secure: process.env.NODE_ENV === "production"
  }
  
  return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(201,
      {user:loggedUser,accessToken,refreshToken},
      "User logged in successfully"))
})

export {registerUser , loginUser}