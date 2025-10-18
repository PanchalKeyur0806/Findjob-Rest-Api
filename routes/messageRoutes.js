import { Router } from "express";
import {
  getAllMessages,
  readMsg,
  sendMessage,
} from "../controllers/chatController/messageController.js";
import { protect } from "../middlewares/protect.js";

const routes = Router();

routes.use(protect);
routes.route("/:chatId").get(getAllMessages).post(sendMessage);
routes.patch("/:chatId/read", readMsg);

export default routes;
