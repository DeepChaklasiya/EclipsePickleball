const Booking = require("../models/Booking");
const Court = require("../models/Court");
const User = require("../models/User");
const TimeSlot = require("../models/TimeSlot");
const { AppError, catchAsync } = require("../utils/errorHandler");

// Get all bookings (for admins)
exports.getAllBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find()
    .populate("user", "name phoneNumber email")
    .populate("court")
    .populate("timeSlot");

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

// Get booking by ID
exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate("user", "name phoneNumber email")
    .populate({
      path: "court",
      populate: {
        path: "location",
      },
    })
    .populate("timeSlot");

  if (!booking) {
    return next(new AppError("No booking found with that ID", 404));
  }

  // Check if the booking belongs to the current user or if user is admin
  if (
    booking.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError("You do not have permission to view this booking", 403)
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      booking,
    },
  });
});

// Get user's bookings
exports.getUserBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate({
      path: "court",
      populate: {
        path: "location",
      },
    })
    .populate("timeSlot");

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

// Create new booking
exports.createBooking = catchAsync(async (req, res, next) => {
  const {
    court: courtId,
    date,
    timeSlot: timeSlotId,
    numberOfPlayers,
    notes,
  } = req.body;

  // Check if court exists
  const court = await Court.findById(courtId);
  if (!court) {
    return next(new AppError("No court found with that ID", 404));
  }

  // Check if time slot exists
  const timeSlot = await TimeSlot.findById(timeSlotId);
  if (!timeSlot) {
    return next(new AppError("No time slot found with that ID", 404));
  }

  // Check if court is available for the given date and time slot
  const existingBooking = await Booking.findOne({
    court: courtId,
    date: new Date(date),
    timeSlot: timeSlotId,
    status: { $ne: "cancelled" },
  });

  if (existingBooking) {
    return next(
      new AppError(
        "This court is already booked for the selected time slot",
        400
      )
    );
  }

  // Calculate total price (in a real app, this would be more complex)
  const totalPrice = court.pricePerHour;

  // Create booking
  const newBooking = await Booking.create({
    user: req.user._id,
    court: courtId,
    date: new Date(date),
    timeSlot: timeSlotId,
    numberOfPlayers,
    totalPrice,
    notes,
    paymentStatus: "pay-at-court", // Default payment status
    status: "confirmed", // Auto-confirm for now
  });

  // Get the full booking with populated fields
  const populatedBooking = await Booking.findById(newBooking._id)
    .populate("user", "name phoneNumber email")
    .populate({
      path: "court",
      populate: {
        path: "location",
      },
    })
    .populate("timeSlot");

  res.status(201).json({
    status: "success",
    data: {
      booking: populatedBooking,
    },
  });
});

// Update booking
exports.updateBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError("No booking found with that ID", 404));
  }

  // Check if the booking belongs to the current user or if user is admin
  if (
    booking.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError("You do not have permission to update this booking", 403)
    );
  }

  // Only allow updating notes and numberOfPlayers
  const { notes, numberOfPlayers } = req.body;
  const updateData = {};
  if (notes !== undefined) updateData.notes = notes;
  if (numberOfPlayers !== undefined)
    updateData.numberOfPlayers = numberOfPlayers;

  // Update booking
  const updatedBooking = await Booking.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("user", "name phoneNumber email")
    .populate({
      path: "court",
      populate: {
        path: "location",
      },
    })
    .populate("timeSlot");

  res.status(200).json({
    status: "success",
    data: {
      booking: updatedBooking,
    },
  });
});

// Cancel booking
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError("No booking found with that ID", 404));
  }

  // Check if the booking belongs to the current user or if user is admin
  if (
    booking.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError("You do not have permission to cancel this booking", 403)
    );
  }

  // Update booking status to cancelled
  booking.status = "cancelled";
  await booking.save();

  res.status(200).json({
    status: "success",
    data: {
      booking,
    },
  });
});
