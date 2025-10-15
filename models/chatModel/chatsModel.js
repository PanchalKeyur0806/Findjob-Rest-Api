import mongoose from "mongoose";

const chatsSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MessageModel",
    },
    status: {
      type: String,
      enum: ["disabled", "enable"],
      default: "enable",
    },
  },
  {
    timestamps: true,
  }
);

const ChatModel = mongoose.model("ChatModel", chatsSchema);

export default ChatModel;
