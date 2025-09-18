import User from "../models/userModel.js";
import Company from "../models/companyModel.js";
import JobModel from "../models/jobModel.js";
import { ClaimModel } from "../models/claimModel.js";

import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { successMessage } from "../utils/successMessage.js";
import { emitSocketEvent } from "../sockets/setupSocketIO.js";
import { socketEvents } from "../sockets/socketEvents.js";

const getRecentStats = async (Model, filter = {}) => {
  const currentDate = new Date();
  const startOfCurrentWeek = new Date(new Date() - 7 * 24 * 60 * 60 * 1000);
  const startOfPreWeek = new Date(new Date() - 14 * 24 * 60 * 60 * 1000);

  const currentWeekCount = await Model.countDocuments({
    ...filter,
    createdAt: { $gte: startOfCurrentWeek, $lte: currentDate },
  });
  const previousWeekCount = await Model.countDocuments({
    ...filter,
    createdAt: { $gte: startOfPreWeek, $lte: currentDate },
  });

  let percentageChange = 0;
  if (previousWeekCount > 0) {
    percentageChange =
      ((currentWeekCount - previousWeekCount) / previousWeekCount) * 100;
  } else {
    percentageChange = currentWeekCount > 0 ? 100 : 0;
  }

  return {
    percentageChange: percentageChange.toFixed(2) + "%",
  };
};

export const getAllStats = catchAsync(async (req, res, next) => {
  const userStats = await getRecentStats(User, { isVerified: true });
  const companyStats = await getRecentStats(Company);
  const jobStats = await getRecentStats(JobModel);
  const claimStats = await getRecentStats(ClaimModel);

  successMessage(res, 200, "success", "analytics found", {
    users: userStats,
    companies: companyStats,
    jobs: jobStats,
    claims: claimStats,
  });
});
