import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const { userId } = req.user;
  const like = await Like.findOne({ userId, videoId });
  if (like) {
    await like.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, "Video unliked successfully"));
  }
  const newLike = new Like({ userId, videoId });
  await newLike.save();
  return res.status(200).json(new ApiResponse(200, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const { userId } = req.user;
  const like = await Like.findOne({ userId, commentId });
  if (like) {
    await like.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, "Comment unliked successfully"));
  }
  const newLike = new Like({ userId, commentId });
  await newLike.save();
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const { userId } = req.user;
  const like = await Like.findOne({ userId, tweetId });
  if (like) {
    await like.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet unliked successfully"));
  }
  const newLike = new Like({ userId, tweetId });
  await newLike.save();
  return res.status(200).json(new ApiResponse(200, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const { userId } = req.user;
  const likes = await Like.find({ userId });
  const videos = await Video.find({
    _id: { $in: likes.map((like) => like.videoId) },
  });
  return res.status(200).json(new ApiResponse(200, "OK", videos));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
