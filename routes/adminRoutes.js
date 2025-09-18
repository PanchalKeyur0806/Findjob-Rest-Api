import { Router } from "express";
import { getAllStats } from "../controllers/adminController.js";

const routes = Router();

routes.get("/allstats", getAllStats);

export default routes;
