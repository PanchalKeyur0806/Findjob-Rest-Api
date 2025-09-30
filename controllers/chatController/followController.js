import Follow from "../../models/chatModel/followModel.js";
import User from "../../models/userModel.js";
import AppError from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";

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

  res.status(200).json({
    status: "success",
    data: {
      newFollow,
    },
  });
});

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

export const unfollowUser = catchAsync(async (req, res, next) => {
  const followerId = req.user._id;
  const targetUserId = req.params.userId;

  // check that user exists
  const existingUser = await User.findById(targetUserId);
  if (!existingUser) return next(new AppError("User doesn't exists", 404));

  //   find the follow relationship
  const deleteFollow = await Follow.findOneAndDelete({
    follower: followerId,
    following: targetUserId,
  });

  res.status(204).json({
    status: "success",
  });
});
