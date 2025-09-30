import fs from "fs";
import { userValidator } from "../middlewares/validators/userProfileValidator.js";
import UserProfile from "../models/userProfile.js";
import { uploadFile } from "../utils/cloudinary.js";

import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { successMessage } from "../utils/successMessage.js";
import User from "../models/userModel.js";

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
  const cloudinaryResponse = await uploadFile(
    file.path,
    "/jobfinder/userResume"
  );

  // remove the file after being uploadeds
  if (req.file && req.file.path) {
    fs.unlinkSync(file.path);
  }

  const userProfile = await UserProfile.create({
    user: userId,
    resumeFile: cloudinaryResponse.url,
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

// Find All the User
export const findAllUser = catchAsync(async (req, res, next) => {
  const { search, email, roles, sort } = req.query;

  let queryObj = {};
  if (search) {
    queryObj.name = { $regex: search, $options: "i" };
  }

  if (email) {
    queryObj.email = { $regex: email, $options: "i" };
  }

  if (roles && roles !== "all") {
    queryObj.roles = roles;
  }

  // sort options
  const sortOptions = {
    new: "-createdAt",
    old: "createdAt",
  };
  const sortKey = sortOptions[sort] || sortOptions.new;

  // pagination
  const page = Number(req.query.page || "1");
  const limit = Number(req.query.limit || "10");
  const skip = (page - 1) * limit;

  const users = await User.find(queryObj).sort(sortKey).skip(skip).limit(limit);

  const totalUsers = await User.countDocuments(queryObj);
  const numOfPages = Math.ceil(totalUsers / limit);

  successMessage(res, 200, "success", "users found", {
    totalUsers,
    numOfPages,
    currentPage: page,
    users,
  });
});
