import express from "express";
import dotenv from "dotenv";

// routes
import authRoutes from "./routes/authRoutes.js";
import errorHandler from "./controllers/errorHandler.js";

dotenv.config({ path: ".env" });

const app = express();

// middlewares
app.use(express.json());

// routes for the application
app.use("/api/auth", authRoutes);
app.use(errorHandler);

export default app;
