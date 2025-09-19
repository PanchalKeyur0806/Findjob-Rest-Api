import { Router } from "express";
import { getAllCharts, getAllStats } from "../controllers/adminController.js";

const routes = Router();

routes.get("/allstats", getAllStats);
routes.get("/allcharts", getAllCharts);

export default routes;
