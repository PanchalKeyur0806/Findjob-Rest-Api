import jwt from "jsonwebtoken";
import { socketEvents } from "./socketEvents.js";
import AppError from "../utils/AppError.js";
import User from "../models/userModel.js";

export const initializeSocketIO = (io) => {
  return io.on("connection", async (socket) => {
    try {
      console.log("User connected");

      const cookie = socket.handshake.headers?.cookie;
      const token = cookie.split("; ")[1].split("token=")[1];

      const decode = jwt.verify(token, process.env.JWT_SECRET);
      if (!decode) throw new AppError("Token not found", 404);

      // find the user
      const user = await User.findById(decode.id).select(
        "-isVerified -__v -otpVerifyTime -authProvider"
      );
      if (!user) throw new AppError("User not found", 404);

      // check that user is admin or not
      if (user.roles !== "admin") throw new AppError("User is not admin", 400);

      socket.user = user;
      socket.join(user._id.toString());

      // Disconnect EVENTS
      socket.on(socketEvents.disconnect, () => {
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
