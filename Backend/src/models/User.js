const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for bookings
userSchema.virtual("bookings", {
  ref: "Booking",
  foreignField: "user",
  localField: "_id",
});

// Create OTP and set expiry
userSchema.methods.createOTP = function () {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  this.otp = {
    code: otpCode,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
  };

  return otpCode;
};

// Verify OTP
userSchema.methods.verifyOTP = function (otpToVerify) {
  // Check if OTP exists and not expired
  if (!this.otp || !this.otp.code || new Date() > this.otp.expiresAt) {
    return false;
  }

  return this.otp.code === otpToVerify;
};

// Clear OTP after successful verification
userSchema.methods.clearOTP = function () {
  this.otp = undefined;
  return this.save({ validateBeforeSave: false });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
