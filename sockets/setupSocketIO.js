import jwt from "jsonwebtoken";
import { socketEvents } from "./socketEvents.js";
import AppError from "../utils/AppError.js";
import User from "../models/userModel.js";

const adminConnectedEvent = (socket, data) => {
  // check that user is admin or not
  if (data.roles !== "admin")
    throw new AppError("Only Admins are allowed", 401);

  socket.user = data;
  socket.join(data._id.toString());

  if (data.roles.toLowerCase() === "admin") {
    socket.join("admins");
    console.log(`Admin joined the room ${socket.id}`);
  }
};

export const initializeSocketIO = (io) => {
  return io.on("connection", async (socket) => {
    try {
      const cookie = socket.handshake.headers?.cookie;
      const token = cookie
        .split("; ")
        .find((token) => token.startsWith("token="))
        .split("token=")[1];

      const decode = jwt.verify(token, process.env.JWT_SECRET);
      if (!decode) throw new AppError("Token not found", 404);

      // find the user
      const user = await User.findById(decode.id).select(
        "-isVerified -__v -otpVerifyTime -authProvider"
      );

      if (!user) throw new AppError("User not found", 404);

      if (user.roles === "admin") {
        adminConnectedEvent(socket, user);
      }

      socket.user = user;
      socket.join(user._id.toString());
      console.log(`user is connected. User Id :- ${user._id.toString()}`);

      // Disconnect EVENT
      socket.on("disconnect", () => {
        console.log("User disconnedted ");

        if (socket.user?._id) {
          socket.leave(socket.user._id);
        }
      });
    } catch (error) {
      socket.emit(socketEvents.error, error?.message);
    }
  });
};

export const emitSocketEvent = (req, roomId, event, payload) => {
  req.app.get("io").to(roomId).emit(event, payload);
};
