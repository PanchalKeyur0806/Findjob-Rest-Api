import mongoose from "mongoose";
import Follow from "../../models/chatModel/followModel.js";
import { Notification } from "../../models/notificationModel.js";
import User from "../../models/userModel.js";
import { emitSocketEvent } from "../../sockets/setupSocketIO.js";
import { socketEvents } from "../../sockets/socketEvents.js";
import AppError from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { successMessage } from "../../utils/successMessage.js";

// find the user
export const findUser = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { email } = req.query;
  const filterObj = {};

  if (email) {
    filterObj._id = { $ne: userId };
    filterObj.email = { $regex: email, $options: "i" };
  }

  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const users = await User.find(filterObj).limit(limit).skip(skip).lean();

  // get logged in user followers and it's following ids
  const follows = await Follow.find({ follower: userId });
  const followingId = follows.map((f) => f.following.toString());

  // change the user Object
  // and check that logged in user is following anyone or not
  const userWithStats = users.map((u) => ({
    ...u,
    isFollowing: followingId.includes(u._id.toString()),
  }));

  successMessage(res, 200, "success", "all users found", userWithStats);
});

// follow particular user
export const followUser = catchAsync(async (req, res, next) => {
  const followerId = req.user._id;
  const targetUserId = req.params.userId;

  //   check that targeted user is exists for not
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) return next(new AppError("user not found", 404));

  //   check if already following
  const existingFollow = await Follow.findOne({
    follower: followerId,
    following: targetUserId,
  });
  if (existingFollow)
    return next(new AppError("You already follow this User", 404));

  //   create follow relationship
  const newFollow = await Follow.create({
    follower: followerId,
    following: targetUserId,
  });

  // check that notification is already created
  const existingNotification = await Notification.find({
    type: "follow",
    "meta.userId": new mongoose.Types.ObjectId(targetUserId),
    "meta.followedUser": followerId.toString(),
  });

  // if notification doesn't exists, create one
  if (existingNotification.length === 0) {
    const notification = await Notification.create({
      type: "follow",
      message: `${req.user.name} started following you.`,
      meta: {
        userId: followerId,
        userName: req.user.name,
        userEmail: req.user.email,
        followedUser: targetUserId,
      },
    });

    // emit socket event
    emitSocketEvent(req, targetUserId, socketEvents.follow, notification);
  }

  res.status(200).json({
    status: "success",
    data: {
      newFollow,
    },
  });
});

// get user followers and following
export const getUserFollowers = catchAsync(async (req, res, next) => {
  const followerId = req.user._id;

  const followers = await Follow.find({ following: followerId }).populate(
    "follower",
    "_id name email"
  );
  const following = await Follow.find({ follower: followerId }).populate(
    "following",
    "_id name email"
  );

  res.status(200).json({
    status: "success",
    data: {
      followers,
      following,
      totalFollowers: followers.length,
      totalFollowing: following.length,
    },
  });
});

// un follow particular user
export const unfollowUser = catchAsync(async (req, res, next) => {
  const followerId = req.user._id;
  const targetUserId = req.params.userId;

  // check that user exists
  const existingUser = await User.findById(targetUserId);
  if (!existingUser) return next(new AppError("User doesn't exists", 404));

  //   find the follow relationship
  await Follow.findOneAndDelete({
    follower: followerId,
    following: targetUserId,
  });

  await Notification.findOneAndDelete({
    type: "follow",
    "meta.userId": followerId,
    "meta.followedUser": targetUserId,
  });

  // create notification
  const notification = await Notification.create({
    type: "unfollow",
    message: `${followerId} have unfollowed you`,
    meta: {
      userId: followerId,
      userName: req.user.name,
      userEmail: req.user.email,
      unfollowedUser: targetUserId,
    },
  });

  emitSocketEvent(req, targetUserId, socketEvents.unfollow, notification);

  res.status(200).json({
    status: "success",
  });
});
