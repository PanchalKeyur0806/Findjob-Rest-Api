import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["user", "company", "jobs", "claims"],
      required: true,
    },
    message: { type: String, required: true, trim: true },
    meta: { type: Object, required: true },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model("Notification", notificationSchema);
