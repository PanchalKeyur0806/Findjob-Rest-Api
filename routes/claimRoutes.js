import { Router } from "express";
import {
  getAllClaim,
  getOneClaim,
  performClaim,
} from "../controllers/claimController.js";
import { protect } from "../middlewares/protect.js";
import { restrictTo } from "../middlewares/restrictTo.js";

const routes = Router();

routes.route("/").get(getAllClaim);
// perform claim on company
routes
  .route("/company/:companyId")
  .post(protect, restrictTo("candidate"), performClaim);
// get claim
routes
  .route("/getclaim/:claimId")
  .get(protect, restrictTo("admin"), getOneClaim);

export default routes;
