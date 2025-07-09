import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  refreshToken,
  changePassword,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getWatchHistory,
  getUserChannelProfile,
} from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Unsecured Routes
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post(
  "/update-cover-image",
  verifyJWT,
  upload.single("coverImage"),
  updateCoverImage
);

// Secured Routes
router.post("/logout", verifyJWT, logoutUser);
router.post("/change-password", verifyJWT, changePassword);
router.get("/profile", verifyJWT, getProfile);
router.get("/channel/:userName", verifyJWT, getUserChannelProfile);
router.post("/update-account-details", verifyJWT, updateAccountDetails);
router.post("/update-avatar", verifyJWT, upload.single("avatar"), updateAvatar);
router.post(
  "/update-cover-image",
  verifyJWT,
  upload.single("coverImage"),
  updateCoverImage
);
router.get("/history", verifyJWT, getWatchHistory);

export default router;
