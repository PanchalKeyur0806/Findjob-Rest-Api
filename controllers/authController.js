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

  successMessage(
    res,
    201,
    "success",
    "User verified successfully",
    findOtp,
    token
  );
});
