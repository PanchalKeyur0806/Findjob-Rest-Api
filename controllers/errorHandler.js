const errorHandler = (err, req, res, next) => {
  const { message } = err;
  res.status(400).json({
    status: "Error",
    message: message,
    stack: err.stack,
  });
};

export default errorHandler;
