// Good Practice

import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      err.statusCode || error instanceof mongoose.Error ? 500 : 400;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, err.message, err.stack);
  }
  const response = {
    ...error,
    message: error.message,
    ...ApiError(
      process.env.NODE_ENV === "development" ? { stack: error.stack } : {}
    ),
  };
  return res.status(error.statusCode).json(response);
};

export { errorHandler };
