import fs from "fs";
import { companyValidator } from "../middlewares/validators/companyValidator.js";
import Company from "../models/companyModel.js";

import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { successMessage } from "../utils/successMessage.js";
import { uploadFile } from "../utils/cloudinary.js";
import { Notification } from "../models/notificationModel.js";
import { emitSocketEvent } from "../sockets/setupSocketIO.js";
import { socketEvents } from "../sockets/socketEvents.js";

export const getComapanies = catchAsync(async (req, res, next) => {
  const companies = await Company.find();
  if (companies.length <= 0) {
    return next(new AppError("Company not found", 404));
  }

  successMessage(res, 200, "success", "companies found", companies);
});

export const getOneCompany = catchAsync(async (req, res, next) => {
  const { companyId } = req.params;

  const company = await Company.findById(companyId);
  if (!company) {
    return next(new AppError("company not found", 404));
  }

  successMessage(res, 200, "success", "company found", company);
});

export const createCompanies = catchAsync(async (req, res, next) => {
  const { error, value } = companyValidator(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 404));
  }

  if (!req.file || !req.file.path) {
    return next(new AppError("File not found", 404));
  }
  const file = req.file.path;

  const {
    companyName,
    email,
    phoneNumber,
    address,
    description,
    website,
    companyLogo,
  } = req.body;

  // uplod images to cloudinary
  const cloudinaryResponse = await uploadFile(file, "/jobfinder/companyLogo");
  if (!cloudinaryResponse) {
    return next(new AppError("Failed to upload image", 400));
  }

  // unlink file from the dir
  if (file) {
    fs.unlinkSync(file);
  }

  const company = await Company.create({
    companyName,
    companyLogo: cloudinaryResponse.url,
    email,
    phoneNumber,
    address,
    description,
    website,
    createdBy: req.user.id,
  });
  if (!company) {
    return next(
      new AppError("Company is not created yet, please try again", 404)
    );
  }

  // create notification
  const notification = await Notification.create({
    type: "company",
    message: `A new Company is created with ${company.email} email id`,
    meta: {
      createdBy: req.user.id,
      companyName: company.companyName,
      companyEmail: company.email,
    },
  });

  // emit socket EVENTS
  emitSocketEvent(req, "admins", socketEvents.company_created, notification);

  successMessage(res, 201, "success", "comapny created", company);
});

export const updateCompany = catchAsync(async (req, res, next) => {
  const { companyId } = req.params;

  const company = await Company.findByIdAndUpdate(companyId, req.body);
  if (!company) {
    return next(new AppError("company not found", 404));
  }

  successMessage(res, 200, "success", "company updated", company);
});

export const deleteCompany = await catchAsync(async (req, res, next) => {
  const { companyId } = req.params;

  const company = await Company.findByIdAndUpdate(companyId, {
    isActive: false,
  });
  if (!company) {
    return next(new AppError("company not found", 404));
  }

  successMessage(res, 204);
});
