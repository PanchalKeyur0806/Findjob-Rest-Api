import { Router } from "express";
import {
  getAllCharts,
  getAllStats,
  totalActiveUser,
} from "../controllers/adminController.js";

const routes = Router();

routes.get("/allstats", getAllStats);
routes.get("/allcharts", getAllCharts);
routes.get("/activeusers", totalActiveUser);

export default routes;
