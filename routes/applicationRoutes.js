import { Router } from "express";
import {
  getAllApplications,
  getAllJobApplication,
  retriveApplication,
  submitApplication,
  viewAllApplications,
  viewApplication,
} from "../controllers/applicationsController.js";

// middlewares
import { protect } from "../middlewares/protect.js";
import { restrictTo } from "../middlewares/restrictTo.js";

const routes = Router();

// user routes

routes.post(
  "/user/submit/:jobId",
  protect,
  restrictTo("candidate"),
  submitApplication
);

routes.get("/user/view/:applciationId", protect, viewApplication);
routes.get(
  "/user/views",
  protect,
  restrictTo("candidate"),
  viewAllApplications
);
routes.delete("/user/retrive/:applciationId", protect, retriveApplication);

// recruiter routes

routes.get(
  "/recruiter/view/:jobId",
  protect,
  restrictTo("recruiter", "admin"),
  getAllJobApplication
);

// admin ruotes
routes.get(
  "/admin/allapplications",
  protect,
  restrictTo("admin"),
  getAllApplications
);

export default routes;
