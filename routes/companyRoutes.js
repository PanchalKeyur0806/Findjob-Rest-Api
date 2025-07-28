import { Router } from "express";
import {
  createCompanies,
  deleteCompany,
  getComapanies,
  getOneCompany,
  updateCompany,
} from "../controllers/companiesController.js";

import { protect } from "../middlewares/protect.js";
import { restrictTo } from "../middlewares/restrictTo.js";

const routes = Router();

// all routes
routes
  .route("/")
  .get(getComapanies)
  .post(protect, restrictTo("recruiter", "admin"), createCompanies);
routes
  .route("/:companyId")
  .get(getOneCompany)
  .patch(protect, restrictTo("recruiter", "admin"), updateCompany)
  .delete(protect, restrictTo("recruiter", "admin"), deleteCompany);

export default routes;
