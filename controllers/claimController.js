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
  const claims = await ClaimModel.find();
  if (claims.length <= 0) {
    return next(new AppError("Claims not found", 404));
  }

  successMessage(res, 200, "success", "claims found", claims);
});

export const getOneClaim = catchAsync(async (req, res, next) => {
  const { claimId } = req.params;

  const claim = await ClaimModel.findById(claimId);
  if (!claim) {
    return next(new AppError("Sorry claim not found", 404));
  }

  successMessage(res, 200, "success", "claim found", claim);
});
