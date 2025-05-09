const jwt = require("jsonwebtoken");
const { AppError, catchAsync } = require("../utils/errorHandler");
const User = require("../models/User");
const { verifyToken } = require("../utils/tokenHandler");

// Check if user is authenticated
exports.protect = catchAsync(async (req, res, next) => {
  // Get token from header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    return next(
      new AppError("You are not logged in. Please log in to get access.", 401)
    );
  }

  // Verify token
  const decoded = verifyToken(token);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id).select("+password");
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  // Check if user is verified
  if (!currentUser.isVerified) {
    return next(
      new AppError("Please verify your account to access this route.", 401)
    );
  }

  // Check if user is active
  if (!currentUser.active) {
    return next(new AppError("This user account has been deactivated.", 401));
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

// Check user role
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
