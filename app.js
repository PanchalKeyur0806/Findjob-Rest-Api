import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

// routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userProfileRoutes from "./routes/userProfile.js";
import companyRoutes from "./routes/companyRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import jobsRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import contactRoutes from "./routes/cotnactusRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import indexRoutes from "./routes/appRoutes.js";
import errorHandler from "./controllers/errorHandler.js";
import { initializeSocketIO } from "./sockets/setupSocketIO.js";
import "./config/passport.js";

dotenv.config({ path: ".env" });

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

app.set("io", io);

// middlewares
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.static(path.join(_dirname, "/public")));
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
app.use("/api/admin", adminRoutes);
app.use("/api/userprofile", userProfileRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/", indexRoutes);

// initialize socket io
initializeSocketIO(io);

app.use(errorHandler);

export default httpServer;
