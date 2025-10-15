import { MessageModel } from "../../models/chatModel/messageModel.js";
import { catchAsync } from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import ChatModel from "../../models/chatModel/chatsModel.js";
import mongoose from "mongoose";
import { emitSocketEvent } from "../../sockets/setupSocketIO.js";
import { socketEvents } from "../../sockets/socketEvents.js";

export const chatMessageCommonAggregation = () => {
  return [
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "sender",
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
              dateOfBirth: 1,
            },
          },
        ],
      },
    },
  ];
};

export const sendMessage = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content) return next(new AppError("Message is required", 404));

  //   find the chat
  const selectedChat = await ChatModel.findById(chatId);
  if (!selectedChat) return next(new AppError("Chat not found", 404));

  //   create the message
  const message = await MessageModel.create({
    sender: userId,
    content: content,
    chat: selectedChat._id,
  });
  if (!message) return next(new AppError("Message not created", 400));

  //   update the chat latest message
  const chat = await ChatModel.findByIdAndUpdate(
    selectedChat._id,
    {
      $set: {
        latestMessage: message._id,
      },
    },
    { new: true }
  );

  // strucutre the message
  const messages = await MessageModel.aggregate([
    { $match: { _id: message._id } },
    ...chatMessageCommonAggregation(),
  ]);

  const receivedMsg = messages[0];
  if (!receivedMsg) return next(new AppError("Internal Server Error", 400));

  //   send socketEvents to each user
  chat.users.forEach((user) => {
    if (user.toString() === userId.toString()) return;

    // emit the socket event
    emitSocketEvent(
      req,
      user.toString(),
      socketEvents.message_received,
      receivedMsg
    );
  });

  return res.status(200).json({
    status: "success",
    message: "message sent successfully",
    receivedMsg,
  });
});

// get all messages

export const getAllMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  const selectedChat = await ChatModel.findById(chatId);
  if (!selectedChat) return next(new AppError("Chat not found", 404));

  // check that user is part of the group
  if (!selectedChat.users.includes(userId))
    return next(new AppError("You are not part of this group", 400));

  const messages = await MessageModel.aggregate([
    {
      $match: { chat: new mongoose.Types.ObjectId(chatId) },
    },
    ...chatMessageCommonAggregation(),
    {
      $sort: { createdAt: 1 },
    },
  ]);

  return res.status(200).json({
    status: "success",
    message: "messages found",
    messages,
  });
});
