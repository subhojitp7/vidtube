import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Common Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// import routes
import healthcheckRoutes from "./routes/healthcheck.routes.js";
import userRoutes from "./routes/user.routers.js";
import videoRoutes from "./routes/video.routes.js";
import likeRoutes from "./routes/like.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import tweetRoutes from "./routes/tweet.routes.js";
// import { errorHandler } from "./middlewares/error.middlewares.js";

// Routes
app.use("/api/healthcheck", healthcheckRoutes);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/like", likeRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/playlist", playlistRoutes);
app.use("/api/tweet", tweetRoutes);

// Error Handler
// app.use(errorHandler);

export default app;
