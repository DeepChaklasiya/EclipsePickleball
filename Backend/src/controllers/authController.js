const User = require("../models/User");
const { AppError, catchAsync } = require("../utils/errorHandler");
const { generateToken } = require("../utils/tokenHandler");
const { generateOTP, sendOTP } = require("../utils/otpHandler");

// Generate and send OTP for login/registration
exports.requestOTP = catchAsync(async (req, res, next) => {
  const { phoneNumber } = req.body;

  // Check if user exists
  let user = await User.findOne({ phoneNumber });
  let isNewUser = false;

  // If user doesn't exist, create a new one
  if (!user) {
    user = await User.create({ phoneNumber });
    isNewUser = true;
  }

  // Generate OTP
  const otp = user.createOTP();
  await user.save({ validateBeforeSave: false });

  // Send OTP (now logs to console in development)
  const result = await sendOTP(phoneNumber, otp);

  // Respond with success
  res.status(200).json({
    status: "success",
    message: `OTP sent to ${phoneNumber}`,
    isNewUser,
    otpSent: result.success,
  });
});

// Verify OTP and authenticate user
exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { phoneNumber, otp } = req.body;

  // Find user by phone number
  const user = await User.findOne({ phoneNumber });

  if (!user) {
    return next(new AppError("User not found for this phone number", 404));
  }

  // Verify OTP
  const isValidOTP = user.verifyOTP(otp);

  if (!isValidOTP) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  // Mark user as verified
  user.isVerified = true;
  await user.clearOTP();

  // Generate JWT token
  const token = generateToken(user._id);

  // Send response
  res.status(200).json({
    status: "success",
    token,
    user: {
      id: user._id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Get current user info
exports.getCurrentUser = catchAsync(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// Update user profile
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  const userId = req.user._id;

  // Update the user
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name, email },
    { new: true, runValidators: true }
  );

  // Send response
  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: updatedUser._id,
        phoneNumber: updatedUser.phoneNumber,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    },
  });
});
