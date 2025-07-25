import jwt from "jsonwebtoken";

import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const protect = catchAsync(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return next(new AppError("Token not found", 404));
  }

  const decode = jwt.decode(token, process.env.JWT_SECRET);
  const user = await User.findById(decode.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  req.user = user;

  next();
});
