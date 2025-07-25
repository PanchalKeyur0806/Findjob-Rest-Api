import e from "express";
import {
  login,
  logout,
  register,
  resendOtp,
  verifyOtp,
} from "../controllers/authController.js";

const routes = e.Router();

routes.post("/register", register);
routes.post("/login", login);
routes.post("/logout", logout);
routes.post("/verifyotp", verifyOtp);
routes.post("/resendotp/:userid", resendOtp);

export default routes;
