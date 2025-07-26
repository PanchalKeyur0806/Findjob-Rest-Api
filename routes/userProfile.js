import e from "express";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userProfileController.js";
import { protect } from "../middlewares/protect.js";

const routes = e.Router();

routes.route("/").post(protect, createUserProfile).get(protect, getUserProfile);
routes.patch("/:profileId", protect, updateUserProfile);

export default routes;
