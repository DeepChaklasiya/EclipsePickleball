const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");

// Get availability (booked courts) for date/time
router.get("/availability", bookingController.getBookedCourts);

// Create a new booking
router.post("/", bookingController.createBooking);

// Get all bookings for a user by phone number
router.get("/user/:phoneNumber", bookingController.getUserBookings);

// Get booking by ID
router.get("/:id", bookingController.getBooking);

module.exports = router;
