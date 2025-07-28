import AppError from "../utils/AppError.js";

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      return next(
        new AppError("You are not allowed to perform this action", 400)
      );
    }

    next();
  };
};
