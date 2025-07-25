import express from "express";

import { protect } from "../middlewares/protect.js";

const routes = express.Router();

routes.get("/", protect, (req, res) => {
  res.send("Home page");
});

export default routes;
