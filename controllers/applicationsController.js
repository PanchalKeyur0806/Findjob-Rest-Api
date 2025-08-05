import Applications from "../models/applicationModel.js";
import UserProfile from "../models/userProfile.js";

import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { successMessage } from "../utils/successMessage.js";

// USERS ACTION

export const submitApplication = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const jobId = req.params.jobId;

  // find user profile
  const findUserProfile = await UserProfile.findOne({ user: userId });
  if (!findUserProfile) {
    return next(new AppError("User profile not found", 400));
  }

  // find user application
  const findApplication = await Applications.findOne({
    userProfile: findUserProfile._id,
    job: jobId,
  });
  if (findApplication) {
    return next(new AppError("You already submitted the application", 400));
  }

  // create application
  const createApplication = await Applications.create({
    userProfile: findUserProfile,
    job: jobId,
  });

  if (!createApplication) {
    return next(new AppError("Application is not created", 400));
  }

  successMessage(res, 201, "success", "application created", createApplication);
});

// view applications
export const viewApplication = catchAsync(async (req, res, next) => {
  const { applciationId } = req.params;

  const findApplication = await Applications.findById(applciationId);
  if (!findApplication) {
    return next(new AppError("Application not found", 404));
  }

  successMessage(res, 200, "success", "application found", findApplication);
});

// retrive application
export const retriveApplication = catchAsync(async (req, res, next) => {
  const { applciationId } = req.params;

  const application = await Applications.findById(applciationId);
  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  // update application
  application.isRetrived = true;
  await application.save();

  successMessage(res, 200, "success", "application updated", application);
});

// RECRUITER ACTION

export const getAllJobApplication = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;

  // find all application on job
  const allApplications = await Applications.find({ job: jobId });
  if (allApplications.length <= 0) {
    return next(new AppError("applications not found", 404));
  }

  successMessage(
    res,
    200,
    "success",
    "all applications found",
    allApplications
  );
});

// ADMIN APPLICATIONS
export const getAllApplications = catchAsync(async (req, res, next) => {
  const applications = await Applications.find();
  if (applications.length <= 0) {
    return next(new AppError("applications not found", 404));
  }

  successMessage(res, 200, "success", "all applications found", applications);
});
