import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate access and refresh tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, fullName, password } = req.body;

  if (
    [userName, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (existedUser) {
    fs.unlinkSync(avatarLocalPath);
    if (coverImageLocalPath) {
      fs.unlinkSync(coverImageLocalPath);
    }
    throw new ApiError(409, "User already exists");
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // Upload avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary");
  }
  console.log("Files uploaded");

  // Upload cover image if provided
  let coverImage;
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (coverImage) {
      console.log("Cover image uploaded to Cloudinary:", coverImage.secure_url);
    } else {
      console.warn(
        "Failed to upload cover image, but continuing with user registration"
      );
    }
  }

  try {
    const user = await User.create({
      userName: userName.toLowerCase(),
      email,
      fullName,
      password,
      avatar: avatar?.url,
      coverImage: coverImage?.url,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong");
    }

    return ApiResponse.success(
      res,
      createdUser,
      "User registered successfully",
      201
    );
  } catch (error) {
    console.log("User registration failed:");
    if (avatar) {
      await deleteOnCloudinary(avatar.public_id);
    }
    if (coverImage) {
      await deleteOnCloudinary(coverImage.public_id);
    }
    throw new ApiError(500, "Something went wrong");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { userName, password } = req.body;

  if ([userName, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ userName: userName.toLowerCase() });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordValid = await user.isPasswordMatch(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    throw new ApiError(500, "Something went wrong");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("accessToken", accessToken, options);
  res.cookie("refreshToken", refreshToken, options);
  return ApiResponse.success(
    res,
    { user: loggedInUser, accessToken, refreshToken },
    "Login successful",
    200
  );
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken"
    );
    if (!user || user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);
    res.cookie("accessToken", accessToken, options);
    res.cookie("refreshToken", newRefreshToken, options);
    return ApiResponse.success(
      res,
      { user, accessToken, refreshToken: newRefreshToken },
      "Refresh token successful",
      200
    );
  } catch (error) {
    throw new ApiError(500, "Failed to generate access and refresh tokens");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if ([oldPassword, newPassword].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findById(req.user._id).select("-refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordMatch(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, {}, "Password changed successfully", 200);
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: "" } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
  return ApiResponse.success(res, {}, "Logout successful", 200);
});

const getProfile = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, req.user, "Get Profile successful", 200);
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { email, fullName } = req.body;

  if ([email, fullName].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { email, fullName } },
    { new: true }
  ).select("-password -refreshToken");

  return ApiResponse.success(
    res,
    updatedUser,
    "Account details updated successfully",
    200
  );
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar?.url } },
    { new: true }
  ).select("-password -refreshToken");

  return ApiResponse.success(
    res,
    updatedUser,
    "Avatar updated successfully",
    200
  );
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverLocalPath = req.file?.path;
  if (!coverLocalPath) {
    throw new ApiError(400, "Cover is required");
  }

  const cover = await uploadOnCloudinary(coverLocalPath);
  if (!cover) {
    throw new ApiError(500, "Failed to upload cover to Cloudinary");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { cover: cover?.url } },
    { new: true }
  ).select("-password -refreshToken");

  return ApiResponse.success(
    res,
    updatedUser,
    "Cover updated successfully",
    200
  );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;
  if (!userName) {
    throw new ApiError(400, "User name is required");
  }

  const channel = await User.aggregate([
    {
      $match: { userName: userName?.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        channelsSubscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      // Project only necessary fields
      $project: {
        _id: 1,
        userName: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        subscriberCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }
  console.log(channel[0]);

  return ApiResponse.success(
    res,
    channel[0],
    "Get channel profile successful",
    200
  );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    userName: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: "$owner" },
            },
          },
        ],
      },
    },
  ]);

  if (!user?.length) {
    throw new ApiError(404, "User not found");
  }

  return ApiResponse.success(
    res,
    user[0]?.watchHistory,
    "Get watch history successful",
    200
  );
});

export {
  registerUser,
  refreshToken,
  loginUser,
  logoutUser,
  getProfile,
  getWatchHistory,
  changePassword,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
};
