import mongoose from "mongoose";
import { claimValidator } from "../middlewares/validators/claimValidator.js";
import { ClaimModel } from "../models/claimModel.js";
import Company from "../models/companyModel.js";
import { Notification } from "../models/notificationModel.js";
import { emitSocketEvent } from "../sockets/setupSocketIO.js";
import { socketEvents } from "../sockets/socketEvents.js";

import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { successMessage } from "../utils/successMessage.js";
import { getAllChartsData } from "./adminController.js";

export const performClaim = catchAsync(async (req, res, next) => {
  const { error, value } = claimValidator(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const { companyId } = req.params;

  const { message } = req.body;
  if (!message) {
    return next(new AppError("Please enter your message", 404));
  }

  const userId = req.user.id;

  const company = await Company.findById(companyId);
  if (!company) {
    return next(new AppError("company not found", 404));
  }

  const claim = await ClaimModel.create({
    user: userId,
    company: company,
    message: message,
  });
  if (!claim) {
    return next(new AppError("sorry claim is not created", 404));
  }

  // creating notifications
  const notification = await Notification.create({
    type: "claims",
    message: `New Claim created :- ${claim._id}`,
    meta: {
      userId: userId,
      companyId: company._id,
      companyName: company.companyName,
      companyEmail: company.email,
      companyPhone: company.phoneNumber,
    },
  });

  emitSocketEvent(req, "admins", socketEvents.claim_created, notification);

  const updateChart = await getAllChartsData();
  emitSocketEvent(req, "admins", socketEvents.charts_updated, updateChart);

  successMessage(
    res,
    201,
    "success",
    "claim is created, it may take a while to perform this action",
    claim
  );
});

export const getAllClaim = catchAsync(async (req, res, next) => {
  const { userName, email, companyName, sort } = req.query;
  const queryObj = {};

  // find by user name and email
  if (userName || email) {
    const filterObj = {};

    if (userName) filterObj.name = { $regex: userName, $options: "i" };
    if (email) filterObj.email = { $regex: email, $options: "i" };

    const users = await mongoose.model("User").find(filterObj).select("_id");
    queryObj.user = { $in: users.map((u) => u._id) };
  }

  // find By company Name
  if (companyName) {
    const filterObj = {};

    if (companyName)
      filterObj.companyName = { $regex: companyName, $options: "i" };

    const company = await mongoose
      .model("Company")
      .find(filterObj)
      .select("_id");

    queryObj.company = { $in: company.map((c) => c._id) };
  }

  // sorting
  const sortOptions = {
    new: "-createdAt",
    old: "createdAt",
  };
  const sortKey = sortOptions[sort] || sortOptions.new;

  // pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const claims = await ClaimModel.find(queryObj)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  const totalClaims = await ClaimModel.countDocuments(queryObj);
  const numOfPages = Math.ceil(totalClaims / limit);

  successMessage(res, 200, "success", "claims found", {
    totalClaims,
    numOfPages,
    currentPage: page,
    claims,
  });
});

export const getOneClaim = catchAsync(async (req, res, next) => {
  const { claimId } = req.params;

  const claim = await ClaimModel.findById(claimId);
  if (!claim) {
    return next(new AppError("Sorry claim not found", 404));
  }

  successMessage(res, 200, "success", "claim found", claim);
});
