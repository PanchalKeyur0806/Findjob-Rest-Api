import { Router } from "express";
import {
  createChat,
  getAllUserChats,
} from "../controllers/chatController/chatController.js";
import { protect } from "../middlewares/protect.js";

const routes = Router();

routes.use(protect);
routes.get("/user/chats", getAllUserChats);
routes.post("/:userId", createChat);

export default routes;
