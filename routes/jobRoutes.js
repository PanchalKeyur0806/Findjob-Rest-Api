import { Router } from "express";

import {
  createJobs,
  deleteJob,
  deleteJobAdmin,
  getAllJobs,
  getAllRecruiterJobs,
  getLatestJobs,
  getOneJob,
} from "../controllers/jobsController.js";

// middlewares
import { protect } from "../middlewares/protect.js";
import { restrictTo } from "../middlewares/restrictTo.js";

const routes = Router();

// aggregation functions
routes.get("/latestjobs", getLatestJobs);

// this routes is only for recruiter
// api/jobs/create/company/:companyId
routes.post(
  "/create/company/:companyId",
  protect,
  restrictTo("recruiter"),
  createJobs
);

routes.get(
  "/get/company/:companyId",
  protect,
  restrictTo("recruiter", "admin"),
  getAllRecruiterJobs
);

routes.delete(
  "/update/job/:jobId",
  protect,
  restrictTo("recruiter"),
  deleteJob
);

// this routes is only for users (candidates)
routes.get(
  "/:jobId",
  protect,
  restrictTo("candidate", "recruiter", "admin"),
  getOneJob
);

// this route is only for admin
routes.route("/").get(protect, restrictTo("admin"), getAllJobs);
routes.delete("/admin/delete/:jobId", deleteJobAdmin);

export default routes;
