import { Router } from "express";
import {
  getAllClaimsNotifications,
  getAllCompanyNotifications,
  getAllJobNotifications,
  getAllUserNotifications,
} from "../controllers/notificationController.js";

const routes = Router();

routes.get("/jobs", getAllJobNotifications);
routes.get("/users", getAllUserNotifications);
routes.get("/companies", getAllCompanyNotifications);
routes.get("/claims", getAllClaimsNotifications);

export default routes;
