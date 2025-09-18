import { jobsValidator } from "../middlewares/validators/jobsValidator.js";
import JobModel from "../models/jobModel.js";

// utils files
import AppError from "../utils/AppError.js";
import ApiFeature from "../utils/ApiFeature.js";
import { catchAsync } from "../utils/catchAsync.js";
import { successMessage } from "../utils/successMessage.js";
import mongoose from "mongoose";
import { emitSocketEvent } from "../sockets/setupSocketIO.js";
import { socketEvents } from "../sockets/socketEvents.js";

// RECRUITERS ACTION

// only recruiters can perform this job
export const createJobs = catchAsync(async (req, res, next) => {
  // check the validators error
  const { error, value } = jobsValidator(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const userId = req.user.id;
  const companyId = req.params.companyId;

  const {
    title,
    employeeType,
    location,
    salary,
    applicationDeadline,
    numberOfOpenings,
    jobCategory,
    educationLevel,
    responsibility,
    requirements,
    niceToHave,
    whatToExcept,
    skills,
    yearsOfExp,
  } = req.body;

  const createJob = await JobModel.create({
    title,
    employeeType,
    location,
    salary,
    applicationDeadline,
    numberOfOpenings,
    jobCategory,
    educationLevel,
    user: userId,
    company: companyId,
    responsibility,
    requirements,
    niceToHave,
    whatToExcept,
    skills,
    yearsOfExp,
  });
  if (!createJob) {
    return next(new AppError("Job not created", 400));
  }

  emitSocketEvent(req, "admins", socketEvents.job_created, createJob);
  console.log("Event is emmited");

  successMessage(res, 201, "success", "job created", createJob);
});

// get all recruiters posted jobs
export const getAllRecruiterJobs = catchAsync(async (req, res, next) => {
  const { companyId } = req.params;

  const jobs = await JobModel.find({ company: companyId });

  if (jobs.length <= 0) {
    return next(new AppError("Job not found", 404));
  }

  successMessage(res, 200, "success", "all jobs found", jobs);
});

export const deleteJob = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await JobModel.findById(jobId);
  const updateJob = await JobModel.findByIdAndUpdate(jobId, {
    isActive: false,
  });

  if (!updateJob) {
    return next(new AppError("Job was not updated", 404));
  }

  successMessage(res, 200, "success", "jobs updated", updateJob);
});

// ADMINS ACTION

// get all jobs (admin)
export const getAllJobs = catchAsync(async (req, res, next) => {
  const { search, employeeType, sort } = req.query;
  const queryObj = {};

  // search by job title and location
  if (search) {
    queryObj.$or = [
      { title: { $regex: search, $options: "i" } },
      {
        location: { $regex: search, $options: "i" },
      },
    ];
  }

  // search by employee Type
  if (employeeType && employeeType !== "all") {
    queryObj.employeeType = employeeType;
  }

  // sorting
  const sortOptions = {
    newest: "-createdAt",
    price: "-price",
  };
  const sortKey = sortOptions[sort] || sortOptions.newest;

  // pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const jobs = await JobModel.find(queryObj)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);
  const totalJobs = await JobModel.countDocuments(queryObj);
  const numOgPages = Math.ceil(totalJobs / limit);

  // const features = new ApiFeature(JobModel.find(), req.query, [
  //   "title",
  //   "skills",
  //   "location",
  // ])
  //   .search()
  //   .filter()
  //   .sort()
  //   .limitFields()
  //   .paginate();

  // const jobs = await features.query;
  if (jobs.length <= 0) {
    return next(new AppError("Jobs not found", 404));
  }

  successMessage(res, 200, "success", "jobs found", {
    totalJobs: totalJobs,
    numOgPages,
    currentPage: page,
    jobs,
  });
});

// delete one job
export const deleteJobAdmin = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;

  const deleteJob = await JobModel.findByIdAndUpdate(jobId, {
    isActive: false,
  });
  if (!deleteJob) {
    return next(new AppError("Job was not deleted or job doesn't exists", 400));
  }

  successMessage(res, 200, "success", "job deleted");
});

// All can perform this action

// get one jobs
export const getOneJob = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;
  const userId = req.user.id;

  // get the current job
  const job = await JobModel.findById(jobId);
  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  // increase the view viewsCount
  // check that user id is exists in viewCount array
  // if yes ignore it
  // otherwise added it
  if (!job.viewedBy.some((user) => user.toString() === userId)) {
    job.viewsCount += 1;
    job.viewedBy.push(userId);

    await job.save();
  }

  successMessage(res, 200, "success", "job found", job);
});

// get latest jobs
export const getLatestJobs = catchAsync(async (req, res, next) => {
  const limit = 10;

  const findLatestJobPipeline = [
    {
      $sort: { createdAt: -1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: "companies",
        localField: "company",
        foreignField: "_id",
        as: "company",
      },
    },
  ];

  const findLatestJob = await JobModel.aggregate(findLatestJobPipeline);

  res.status(200).json({
    status: "success",
    message: "all latest jobs found",
    length: findLatestJob.length,
    data: findLatestJob,
  });
});
