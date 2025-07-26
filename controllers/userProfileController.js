import UserProfile from "../models/userProfile.js";

import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { successMessage } from "../utils/successMessage.js";

export const createUserProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { user, resumeFile, education, skills } = req.body;

  const userProfile = await UserProfile.create({
    user: userId,
    resumeFile,
    education,
    skills,
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
