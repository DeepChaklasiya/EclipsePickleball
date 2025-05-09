const express = require("express");
const timeSlotController = require("../controllers/timeSlotController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", timeSlotController.getAllTimeSlots);
router.get("/available", timeSlotController.getAvailableTimeSlots);
router.get("/:id", timeSlotController.getTimeSlot);

// Admin routes - protected
router.use(protect);
router.use(restrictTo("admin"));

router.route("/").post(timeSlotController.createTimeSlot);

router
  .route("/:id")
  .patch(timeSlotController.updateTimeSlot)
  .delete(timeSlotController.deleteTimeSlot);

module.exports = router;
