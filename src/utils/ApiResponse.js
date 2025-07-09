class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.success = statusCode < 400;
  }

  // Static method to create and send a successful response
  static success(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  // Static method to create and send an error response
  static error(res, message = "Internal Server Error", statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export { ApiResponse };
