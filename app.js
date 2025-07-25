import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// routes
import authRoutes from "./routes/authRoutes.js";
import errorHandler from "./controllers/errorHandler.js";

dotenv.config({ path: ".env" });

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());

// routes for the application
app.use("/api/auth", authRoutes);
app.use(errorHandler);

export default app;
