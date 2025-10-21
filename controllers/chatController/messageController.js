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

  // find the opp user Id
  const oppUserId = selectedChat.users.find(
    (usr) => usr.toString() !== userId.toString()
  );

  const messages = await MessageModel.aggregate([
    {
      $match: { chat: new mongoose.Types.ObjectId(chatId) },
    },
    ...chatMessageCommonAggregation(),
    {
      $addFields: {
        isRead: { $in: [oppUserId, "$readBy"] },
      },
    },
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

// read all the messages
export const readMsg = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  let targetUserId;

  // find the chat
  const findChat = await ChatModel.findById(chatId);
  if (findChat) {
    targetUserId = findChat.users.find(
      (usr) => usr.toString() !== userId.toString()
    );
  }

  // update all the messages that are not sent by current User
  await MessageModel.updateMany(
    {
      chat: chatId,
      sender: { $ne: userId },
      readBy: { $ne: userId },
    },
    {
      $addToSet: { readBy: userId },
    }
  );

  // emit socket event
  emitSocketEvent(req, targetUserId.toString(), socketEvents.message_read, {
    chatId,
    userId,
    targetUserId,
  });

  // send response
  res.status(200).json({
    status: "success",
    message: "message read successfully",
  });
});

// delete messages
export const deleteMsgs = catchAsync(async (req, res, next) => {
  const { chatId, messageId } = req.params;
  const userId = req.user._id;

  // find the chat
  const findChat = await ChatModel.findById(chatId);
  if (!findChat) return next(new AppError("Chat not found", 404));

  // find all the messages
  const message = await MessageModel.findById(messageId);
  if (!message) return next(new AppError("Messages not found", 404));

  // check the sender of the msg
  if (message.sender.toString() !== userId.toString())
    return next(
      new AppError("You are not allowed to perform this action", 403)
    );

  // delete the msg from the DB
  await MessageModel.findByIdAndDelete(messageId);

  // if deleted msg was the last msg
  if (findChat.latestMessage.toString() === message._id.toString()) {
    const lastMsg = await MessageModel.findOne({ chat: chatId })
      .sort({
        createdAt: -1,
      })
      .limit(1);

    await ChatModel.findByIdAndUpdate(chatId, {
      latestMessage: lastMsg ? lastMsg._id : null,
    });
  }

  // emit socket event to each user
  findChat.users.forEach((usr) => {
    if (usr.toString() === userId.toString()) return;

    emitSocketEvent(req, usr.toString(), socketEvents.message_deleted, message);
  });

  // send the response
  res.status(200).json({
    status: "success",
    message: "Message deleted successfully",
    data: message,
  });
});
