import { Router } from "express";
import {
  getAllClaimsNotifications,
  getAllCompanyNotifications,
  getAllJobNotifications,
  getAllUserNotifications,
  getUserFollowerNotification,
} from "../controllers/notificationController.js";
import { protect } from "../middlewares/protect.js";

const routes = Router();

routes.get("/jobs", getAllJobNotifications);
routes.get("/users", getAllUserNotifications);
routes.get("/companies", getAllCompanyNotifications);
routes.get("/claims", getAllClaimsNotifications);
routes.get("/follow/me", protect, getUserFollowerNotification);

export default routes;
