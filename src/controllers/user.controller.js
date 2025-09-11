import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiError.js";
import { User } from "../models/User.models.js";
import { ApiResponse } from "../util/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(402, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  //validation
  if ([userName, email, password].some((feild) => feild?.trim() === "")) {
    throw new ApiError(400, "All feilds required");
  }
  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }
  const user = await User.create({
    userName,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!createdUser) {
    throw new ApiError(400, "SOmething went wrong in creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(401, "Please enter email");
  }

  const user = await User.findOne({
    email,
  });
  if (!user) {
    throw new ApiError(400, "User not found");
  }
  //validation
  const passwordCorrect = await user.isPasswordCorrect(password);
  if (!passwordCorrect) {
    throw new ApiError(401, "Invalid Credentials");
  }
  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        { user: loggedUser, accessToken, refreshToken },
        "User logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true },
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiError(200, {}, "User Logged Out"));
});

const getCurrentUser = asyncHandler(async (req,res) => {
  const user = await User.findById(req.user?._id)
    .select("-password -refreshToken")
  return res.status(200)
    .jason(new ApiResponse(
      200,user,"User data fetched"
    ))
})

const updatePassword = asyncHandler(async (req,res) => {
  const {oldPassword, newPassword} = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(401,"Old Password not correct");  
  }
  user.password = newPassword;
  await user.save({validateBeforeSave:false});

  return res.status(200)
    .jason(new ApiResponse(
      200,{},"Password changed Successfully"
    ))
})

const updateAccountDetails = asyncHandler(async (req,res) => {
  const {userName} = req.body
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        userName,
      },
    },
    { new: true },
  ).select("-password -refreshToken");
  
  return res.status(200)
    .json(new ApiResponse(
      200,{userUpdated}
    ))
})

//Refreshing the expired access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken; //For Web it's coming from cookie, for mobile from body

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(402, "Invalid Refresh Token");
    }

    //Verify if user is Authorized, verifying this Refresh token to DB
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(402, "Invalid Refresh Token");
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    //generating new Access Token
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user._id,
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          201,
          { accessToken, refresToken: newRefreshToken },
          "Access Token Refreshed successfully",
        ),
      );
  } catch (error) {
    throw new ApiError(401, "error");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken,
  updatePassword, getCurrentUser
}; 
