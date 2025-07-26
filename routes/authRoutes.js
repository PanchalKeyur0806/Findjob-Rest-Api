import e from "express";
import passport from "passport";
import {
  login,
  logout,
  register,
  resendOtp,
  verifyOtp,
  googleCallback,
  forgotpassword,
  resetPassword,
} from "../controllers/authController.js";

const routes = e.Router();

routes.post("/register", register);
routes.post("/login", login);
routes.post("/logout", logout);
routes.post("/verifyotp", verifyOtp);
routes.post("/forgotpassword", forgotpassword);
routes.post("/resetpassword/:token", resetPassword);
routes.post("/resendotp/:userid", resendOtp);

routes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
routes.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/login",
  }),
  googleCallback
);

export default routes;
