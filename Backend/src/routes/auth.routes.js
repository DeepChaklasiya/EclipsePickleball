const express = require("express");
const authController = require("../controllers/authController");
const {
  validatePhoneNumber,
  validateOTP,
} = require("../middleware/validationMiddleware");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/request-otp", validatePhoneNumber, authController.requestOTP);
router.post(
  "/verify-otp",
  validatePhoneNumber,
  validateOTP,
  authController.verifyOTP
);

// Protected routes
router.get("/me", protect, authController.getCurrentUser);
router.patch("/update-profile", protect, authController.updateProfile);

module.exports = router;
