import mongoose from "mongoose";
import ChatModel from "../../models/chatModel/chatsModel.js";
import Follow from "../../models/chatModel/followModel.js";
import User from "../../models/userModel.js";
import AppError from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";

export const chatCommonAggregation = () => {
  return [
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "users",
        as: "users",
        pipeline: [
          {
            $project: {
              password: 0,
              phoneNumber: 0,
              authProvider: 0,
              roles: 0,
              createdAt: 0,
              updatedAt: 0,
              __v: 0,
            },
          },
        ],
      },
    },
  ];
};

export const createChat = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const targetUserId = req.params.userId;

  //   check that target user exists or not
  const existingUser = await User.findById(targetUserId);
  if (!existingUser) return next(new AppError("User doesn't exist", 404));

  // check that both id is same or not
  if (userId.toString() === targetUserId.toString())
    return next(new AppError("You can't chat with your self", 400));

  //   check that both follows each other
  const checkFollowers = await Follow.findOne({
    follower: userId,
    following: targetUserId,
  });
  if (!checkFollowers)
    return next(new AppError("Please Follow Each Other", 400));

  //   find the chat
  const chat = await ChatModel.aggregate([
    {
      $match: {
        $and: [
          {
            users: { $elemMatch: { $eq: userId } },
          },
          {
            users: {
              $elemMatch: { $eq: new mongoose.Types.ObjectId(targetUserId) },
            },
          },
        ],
      },
    },
    ...chatCommonAggregation(),
  ]);
  if (chat.length) {
    return res.status(200).json({
      status: "success",
      data: chat,
    });
  }

  const newChat = await ChatModel.create({
    users: [userId, targetUserId],
  });
  if (!newChat) return next(new AppError("Failed to create chat", 400));

  const createdChat = await ChatModel.aggregate([
    { $match: { _id: newChat._id } },
    ...chatCommonAggregation(),
  ]);

  const payload = createdChat[0];
  if (!payload) return next(new AppError("Internal server error", 400));

  res.status(200).json({
    status: "success",
    payload,
  });
});

// list all users chat
export const getAllUserChats = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const findChats = await ChatModel.aggregate([
    {
      $match: { users: { $elemMatch: { $eq: userId } } },
    },
    {
      $addFields: {
        users: {
          $filter: {
            input: "$users",
            as: "users",
            cond: { $ne: ["$$users", userId] },
          },
        },
      },
    },
    ...chatCommonAggregation(),
  ]);

  res.status(200).json({
    status: "success",
    message: "all chats found",
    data: findChats,
  });
});
