import { Notification } from "../models/notificationModel.js";

import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { successMessage } from "../utils/successMessage.js";

export const getAllJobNotifications = catchAsync(async (req, res, next) => {
  const jobsNotifications = await Notification.find({ type: "jobs" });

  successMessage(
    res,
    200,
    "success",
    "Jobs notification found",
    jobsNotifications
  );
});

export const getAllCompanyNotifications = catchAsync(async (req, res, next) => {
  const companyNotifications = await Notification.find({ type: "company" });

  successMessage(
    res,
    200,
    "success",
    "company notification found",
    companyNotifications
  );
});
export const getAllUserNotifications = catchAsync(async (req, res, next) => {
  const userNotifications = await Notification.find({ type: "user" });

  successMessage(
    res,
    200,
    "success",
    "user notification found",
    userNotifications
  );
});
export const getAllClaimsNotifications = catchAsync(async (req, res, next) => {
  const claimsNotifications = await Notification.find({ type: "claims" });

  successMessage(
    res,
    200,
    "success",
    "claims notification found",
    claimsNotifications
  );
});
