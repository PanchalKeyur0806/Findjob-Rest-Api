import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { generateOtp } from "../utils/otp-generate.js";
import { successMessage } from "../utils/successMessage.js";
import { sendEmail } from "../utils/nodemailer.js";

// sign token
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, dateOfBirth, phoneNumber } = req.body;

  // generate the otp
  const generatedOtp = generateOtp();

  //   save user to db
  const user = await User.create({
    name,
    email,
    password,
    dateOfBirth,
    phoneNumber,
    otp: generatedOtp,
  });
  if (!user) {
    return next(new AppError("User not created", 404));
  }

  //   generate text for sending email
  const subject = "Your otp";
  const message = `heres your otp ${generatedOtp}`;

  //   send email to client
  sendEmail({
    subject: subject,
    message: message,
    email: email,
  });

  //   send success message to user
  successMessage(res, 201, "success", "email sent successfully");
});

// verify the token
export const verifyOtp = catchAsync(async (req, res, next) => {
  const { otp } = req.body;
  if (!otp) {
    return next(new AppError("Please provide the otp", 404));
  }

  // find the otp
  const findOtp = await User.findOne({ otp });
  if (!findOtp) {
    return next(new AppError("Otp not found", 404));
  }

  // check the otp is expired or not
  const otpDate = new Date(findOtp.otpVerifyTime).getTime();
  const currentDate = new Date().getTime();

  if (currentDate >= otpDate) {
    return next(new AppError("Otp is expired", 404));
  }

  // set in db that user is verified
  findOtp.isVerified = true;
  findOtp.otp = undefined;
  findOtp.otpVerifyTime = undefined;

  await findOtp.save();

  // generate the token
  const token = signToken(findOtp._id);

  // set token to cookie
  res.cookie("token", token);

  successMessage(
    res,
    201,
    "success",
    "User verified successfully",
    findOtp,
    token
  );
});

// resend the otp
export const resendOtp = catchAsync(async (req, res, next) => {
  const { userid } = req.params;
  if (!userid) {
    return next(new AppError("please provide usreid in params", 404));
  }

  // generate new otp
  const otp = generateOtp();

  if (!otp) {
    return next(new AppError("Otp is not generated", 404));
  }

  // save otp to db
  const user = await User.findById(userid);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.isVerified) {
    return next(new AppError("User is already verified", 400));
  }

  user.otp = otp;
  user.otpVerifyTime = Date.now() + 60 * 1000;
  await user.save();

  // send email to client
  const subject = "Your otp";
  const message = `heres your otp ${otp}`;

  //   send email to client
  sendEmail({
    subject: subject,
    message: message,
    email: user.email,
  });

  successMessage(res, 200, "success", "otp is sent");
});

// logout functionality
export const logout = catchAsync(async (req, res, next) => {
  res.clearCookie("token");
  successMessage(res, 200, "success", "user is logged out");
});

// login functionality
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const correctPassword = await user.comparePassword(password, user.password);
  if (!correctPassword) {
    return next(new AppError("password does not match", 404));
  }

  const token = signToken(user._id);

  res.cookie("token", token);

  successMessage(res, 200, "success", "user is logged in", user, token);
});
