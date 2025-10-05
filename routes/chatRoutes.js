import { Router } from "express";
import { createChat } from "../controllers/chatController/chatController.js";
import { protect } from "../middlewares/protect.js";

const routes = Router();

routes.use(protect);
routes.post("/:userId", createChat);

export default routes;
