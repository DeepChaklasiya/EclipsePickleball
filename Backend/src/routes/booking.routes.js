const express = require("express");
const bookingController = require("../controllers/bookingController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { validateBookingData } = require("../middleware/validationMiddleware");

const router = express.Router();

// All booking routes are protected
router.use(protect);

// Regular user routes
router.get("/user", bookingController.getUserBookings);
router.post("/", validateBookingData, bookingController.createBooking);

// Routes for specific bookings
router
  .route("/:id")
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.cancelBooking);

// Admin only routes
router.use(restrictTo("admin"));
router.get("/", bookingController.getAllBookings);

module.exports = router;
