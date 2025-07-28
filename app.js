import express from "express";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";

// routes
import authRoutes from "./routes/authRoutes.js";
import userProfileRoutes from "./routes/userProfile.js";
import companyRoutes from "./routes/companyRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import indexRoutes from "./routes/appRoutes.js";
import errorHandler from "./controllers/errorHandler.js";
import "./config/passport.js";

dotenv.config({ path: ".env" });

const app = express();

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SEC,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// routes for the application
app.use("/api/auth", authRoutes);
app.use("/api/userprofile", userProfileRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/claims", claimRoutes);
app.use("/", indexRoutes);

app.use(errorHandler);

export default app;
