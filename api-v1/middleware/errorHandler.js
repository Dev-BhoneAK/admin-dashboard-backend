// Middleware to handle 404 Not Found errors
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware to handle errors and send appropriate responses
export const errorHandler = (err, req, res, next) => {
  try {
    const statusCode =
      err.message !== ""
        ? res.statusCode === 404
          ? res.statusCode
          : 400
        : res.statusCode || 500;

    res.status(statusCode);
    res.json({
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};
