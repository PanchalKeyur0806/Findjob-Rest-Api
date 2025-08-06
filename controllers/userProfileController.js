import fs from "fs";
import { userValidator } from "../middlewares/validators/userProfileValidator.js";
import UserProfile from "../models/userProfile.js";
import { uploadFile } from "../utils/cloudinary.js";

import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { successMessage } from "../utils/successMessage.js";

export const createUserProfile = catchAsync(async (req, res, next) => {
  const { error, value } = userValidator(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const file = req.file;
  if (!file) return next(new AppError("file not found", 404));

  const userId = req.user.id;
  const { resumeFile, education, skills, experience, jobPrefrence } = req.body;

  // uploading the file
  const cloudinaryResponse = await uploadFile(file.path);

  // remove the file after being uploadeds
  if (req.file && req.file.path) {
    fs.unlinkSync(file.path);
  }

  const userProfile = await UserProfile.create({
    user: userId,
    resumeFile: cloudinaryResponse.secure_url,
    education,
    skills,
    experience,
    jobPrefrence,
  });

  if (!userProfile) {
    return next(
      new AppError("user profile is not created, please try again later", 400)
    );
  }

  successMessage(res, 201, "success", "userProfile created", userProfile);
});

export const getUserProfile = catchAsync(async (req, res, next) => {
  const user = req.user.id;

  const userProfile = await UserProfile.findOne({ user });
  if (!userProfile) {
    return next(new AppError("user profile not found", 404));
  }

  successMessage(res, 200, "success", "user profile found", userProfile);
});

export const updateUserProfile = catchAsync(async (req, res, next) => {
  const { profileId } = req.params;
  if (!profileId) {
    return next(new AppError("please provide user profile id", 404));
  }

  const userProfile = await UserProfile.findByIdAndUpdate(profileId, req.body);

  successMessage(res, 200, "success", "user Profile updated");
});
