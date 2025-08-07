import e from "express";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userProfileController.js";

// middlewares
import { protect } from "../middlewares/protect.js";
import { upload } from "../middlewares/multer.middleware.js";

const routes = e.Router();

routes
  .route("/")
  .post(protect, upload.single("resumeFile"), createUserProfile)
  .get(protect, getUserProfile);
routes.patch("/:profileId", protect, updateUserProfile);

export default routes;
