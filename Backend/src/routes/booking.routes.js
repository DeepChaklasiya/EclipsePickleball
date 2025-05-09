const express = require("express");
const bookingController = require("../controllers/booking.controller");

const router = express.Router();

// Create a new booking
router.post("/", bookingController.createBooking);

// Get all bookings for a user by phone number
router.get("/user/:phoneNumber", bookingController.getUserBookings);

// Get booked courts for a specific date and time
// IMPORTANT: This specific route must come before the generic /:id route
router.get("/availability", bookingController.getBookedCourts);

// Get a specific booking by ID
router.get("/:id", bookingController.getBooking);

// Cancel a booking
router.patch("/:id/cancel", bookingController.cancelBooking);

module.exports = router;
