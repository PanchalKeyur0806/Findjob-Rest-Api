import Follow from "../models/chatModel/followModel.js";
import { Notification } from "../models/notificationModel.js";

import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { successMessage } from "../utils/successMessage.js";

export const getAllJobNotifications = catchAsync(async (req, res, next) => {
  const jobsNotifications = await Notification.find({ type: "jobs" }).sort(
    "-createdAt"
  );

  successMessage(
    res,
    200,
    "success",
    "Jobs notification found",
    jobsNotifications
  );
});

export const getAllCompanyNotifications = catchAsync(async (req, res, next) => {
  const companyNotifications = await Notification.find({
    type: "company",
  }).sort("-createdAt");

  successMessage(
    res,
    200,
    "success",
    "company notification found",
    companyNotifications
  );
});
export const getAllUserNotifications = catchAsync(async (req, res, next) => {
  const userNotifications = await Notification.find({ type: "user" }).sort(
    "-createdAt"
  );

  successMessage(
    res,
    200,
    "success",
    "user notification found",
    userNotifications
  );
});
export const getAllClaimsNotifications = catchAsync(async (req, res, next) => {
  const claimsNotifications = await Notification.find({ type: "claims" }).sort(
    "-createdAt"
  );

  successMessage(
    res,
    200,
    "success",
    "claims notification found",
    claimsNotifications
  );
});

// find all the followers  notifications of particular user
export const getUserFollowerNotification = catchAsync(
  async (req, res, next) => {
    const userId = req.user._id;

    const notification = await Notification.find({
      type: "follow",
      "meta.followedUser": userId.toString(),
    });

    const followersId = notification.map((n) => n.meta.userId);

    const alreadyFollowed = await Follow.find({
      follower: userId,
      following: { $in: followersId },
    }).select("following");

    const alreadyFOllowedSet = new Set(
      alreadyFollowed.map((f) => f.following.toString())
    );

    const notFollowedSet = notification.filter(
      (n) => !alreadyFOllowedSet.has(n.meta.userId.toString())
    );

    successMessage(res, 200, "success", "notifications found", notFollowedSet);
  }
);
