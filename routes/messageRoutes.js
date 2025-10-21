import { Router } from "express";
import {
  deleteMsgs,
  getAllMessages,
  readMsg,
  sendMessage,
} from "../controllers/chatController/messageController.js";
import { protect } from "../middlewares/protect.js";

const routes = Router();

routes.use(protect);
routes.route("/:chatId").get(getAllMessages).post(sendMessage);
routes.patch("/:chatId/read", readMsg);
routes.route("/:chatId/:messageId").delete(deleteMsgs);

export default routes;
