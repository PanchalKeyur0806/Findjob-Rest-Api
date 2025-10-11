import { Router } from "express";
import {
  findUser,
  followUser,
  getUserFollowers,
  unfollowUser,
} from "../controllers/chatController/followController.js";
import { protect } from "../middlewares/protect.js";

const routes = Router();

routes.use(protect);
routes.post("/follow/:userId", followUser);
routes.post("/unfollow/:userId", unfollowUser);
routes.get("/follower/", getUserFollowers);
routes.get("/search", findUser);

export default routes;
