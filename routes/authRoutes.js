import e from "express";
import {
  register,
  resendOtp,
  verifyOtp,
} from "../controllers/authController.js";

const routes = e.Router();

routes.post("/register", register);
routes.post("/verifyotp", verifyOtp);
routes.post("/resendotp/:userid", resendOtp);

export default routes;
