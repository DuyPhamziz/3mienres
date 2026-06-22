class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Đánh dấu lỗi này là lỗi do người
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
