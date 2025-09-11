import jwt from "jsonwebtoken";
import { User } from "../models/User.models.js";
import { ApiError } from "../util/ApiError.js";
import { asyncHandler } from "../util/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookie.accessToken ||
    req.header("Authorization").replace("Beerer ", "");
  if (!token) {
    throw new ApiError(401, "Token not found: Unauthorized");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized");
  }
});
