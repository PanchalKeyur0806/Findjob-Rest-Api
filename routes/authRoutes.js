import e from "express";
import { register, verifyOtp } from "../controllers/authController.js";

const routes = e.Router();

routes.post("/register", register);
routes.post("/verifyotp", verifyOtp);

export default routes;
