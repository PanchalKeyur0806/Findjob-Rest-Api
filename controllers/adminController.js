import User from "../models/userModel.js";
import Company from "../models/companyModel.js";
import JobModel from "../models/jobModel.js";
import { ClaimModel } from "../models/claimModel.js";

import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { successMessage } from "../utils/successMessage.js";
import { emitSocketEvent } from "../sockets/setupSocketIO.js";
import { socketEvents } from "../sockets/socketEvents.js";

const getRecentStats = async (Model) => {
  const currentDate = new Date();
  const startOfCurrentWeek = new Date(new Date() - 7 * 24 * 60 * 60 * 1000);
  const startOfPreWeek = new Date(new Date() - 14 * 24 * 60 * 60 * 1000);

  const currentWeekCount = await Model.countDocuments({
    createdAt: { $gte: startOfCurrentWeek, $lt: currentDate },
  });

  const previousWeekCount = await Model.countDocuments({
    createdAt: { $gte: startOfPreWeek, $lt: startOfCurrentWeek },
  });

  const totalDocuments = await Model.countDocuments({
    createdAt: { $gte: startOfPreWeek, $lte: currentDate },
  });

  let percentageChange = 0;
  if (previousWeekCount > 0) {
    percentageChange =
      ((previousWeekCount - currentWeekCount) / totalDocuments) * 100;
  } else {
    percentageChange = currentWeekCount > 0 ? 100 : 0;
  }

  return {
    percentageChange: percentageChange.toFixed(2) + "%",
  };
};

export const getAllStats = catchAsync(async (req, res, next) => {
  const userStats = await getRecentStats(User);
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

export const getAllCharts = catchAsync(async (req, res, next) => {
  const currentDate = new Date();
  const previousWeekDate = new Date(new Date() - 7 * 24 * 60 * 60 * 1000);

  const [user, companies, jobs, claims] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: previousWeekDate, $lte: currentDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),

    Company.aggregate([
      { $match: { createdAt: { $gte: previousWeekDate, $lte: currentDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),

    JobModel.aggregate([
      { $match: { createdAt: { $gte: previousWeekDate, $lte: currentDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
    ClaimModel.aggregate([
      { $match: { createdAt: { $gte: previousWeekDate, $lte: currentDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const statsMap = {};
  const collections = { user, companies, jobs, claims };
  let results = [];

  Object.entries(collections).forEach(([key, arr]) => {
    arr.forEach(({ _id, count }) => {
      if (!statsMap[_id]) {
        statsMap[_id] = {
          date: _id,
          user: 0,
          companies: 0,
          jobs: 0,
          claims: 0,
        };
      }
      statsMap[_id][key] = count;
    });
  });

  for (
    let date = new Date(
      previousWeekDate.setDate(previousWeekDate.getDate() + 1)
    );
    date <= currentDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dateStr = date.toISOString().split("T")[0];

    results.push(
      statsMap[dateStr] || {
        date: dateStr,
        user: 0,
        companies: 0,
        jobs: 0,
        claims: 0,
      }
    );
  }

  successMessage(res, 200, "success", "analytics found", results);
});

// total active users
export const totalActiveUser = catchAsync(async (req, res, next) => {
  const users = await User.aggregate([
    {
      $facet: {
        totalActiveUsers: [
          {
            $match: { isVerified: true },
          },
          {
            $group: {
              _id: "$isVerified",
              count: { $sum: 1 },
            },
          },
        ],
        totalInActiveUsers: [
          { $match: { isVerified: { $ne: true } } },
          {
            $group: {
              _id: "$isVerified",
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  const statsMap = [
    {
      totalActiveUser: users[0].totalActiveUsers[0].count,
      totalInActiveUsers: users[0].totalInActiveUsers[0].count,
    },
  ];

  successMessage(res, 200, "success", "active users found", statsMap);
});
