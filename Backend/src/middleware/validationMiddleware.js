const { AppError } = require("../utils/errorHandler");

// Validate phone number format
exports.validatePhoneNumber = (req, res, next) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return next(new AppError("Phone number is required", 400));
  }

  // Remove spaces, dashes, and other non-numeric characters
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");

  // Check if phone number is valid (simple check for length)
  if (cleanPhoneNumber.length < 10 || cleanPhoneNumber.length > 15) {
    return next(new AppError("Please provide a valid phone number", 400));
  }

  // Add the cleaned phone number to the request body
  req.body.phoneNumber = cleanPhoneNumber;
  next();
};

// Validate OTP format
exports.validateOTP = (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next(new AppError("OTP is required", 400));
  }

  // Check if OTP is a 6-digit number
  if (!/^\d{6}$/.test(otp)) {
    return next(new AppError("OTP must be a 6-digit number", 400));
  }

  next();
};

// Validate booking data
exports.validateBookingData = (req, res, next) => {
  const { court, date, timeSlot, numberOfPlayers } = req.body;

  if (!court) {
    return next(new AppError("Court ID is required", 400));
  }

  if (!date) {
    return next(new AppError("Date is required", 400));
  }

  if (!timeSlot) {
    return next(new AppError("Time slot is required", 400));
  }

  if (!numberOfPlayers || numberOfPlayers < 1 || numberOfPlayers > 4) {
    return next(new AppError("Number of players must be between 1 and 4", 400));
  }

  next();
};
