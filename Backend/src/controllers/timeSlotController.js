const TimeSlot = require("../models/TimeSlot");
const Booking = require("../models/Booking");
const { AppError, catchAsync } = require("../utils/errorHandler");

// Get all time slots
exports.getAllTimeSlots = catchAsync(async (req, res, next) => {
  const timeSlots = await TimeSlot.find({ active: true });

  res.status(200).json({
    status: "success",
    results: timeSlots.length,
    data: {
      timeSlots,
    },
  });
});

// Get time slot by ID
exports.getTimeSlot = catchAsync(async (req, res, next) => {
  const timeSlot = await TimeSlot.findById(req.params.id);

  if (!timeSlot) {
    return next(new AppError("No time slot found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      timeSlot,
    },
  });
});

// Create new time slot (admin only)
exports.createTimeSlot = catchAsync(async (req, res, next) => {
  const newTimeSlot = await TimeSlot.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      timeSlot: newTimeSlot,
    },
  });
});

// Update time slot (admin only)
exports.updateTimeSlot = catchAsync(async (req, res, next) => {
  const timeSlot = await TimeSlot.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!timeSlot) {
    return next(new AppError("No time slot found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      timeSlot,
    },
  });
});

// Delete time slot (admin only)
exports.deleteTimeSlot = catchAsync(async (req, res, next) => {
  // Soft delete by setting active to false
  const timeSlot = await TimeSlot.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true }
  );

  if (!timeSlot) {
    return next(new AppError("No time slot found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Get available time slots for a specific date and court
exports.getAvailableTimeSlots = catchAsync(async (req, res, next) => {
  const { date, courtId } = req.query;

  if (!date) {
    return next(new AppError("Date is required", 400));
  }

  // Parse date
  const selectedDate = new Date(date);

  // Get all time slots
  const timeSlots = await TimeSlot.find({ active: true });

  // Filter time slots available for the selected day of week
  const dayOfWeek = selectedDate.getDay();
  const availableTimeSlots = timeSlots.filter((slot) =>
    slot.daysAvailable.includes(dayOfWeek)
  );

  // If court is provided, check existing bookings for this court and date
  let bookedSlots = [];
  if (courtId) {
    // Format date for query (strip time part)
    const formattedDate = new Date(selectedDate);
    formattedDate.setHours(0, 0, 0, 0);

    // Find bookings for this court and date
    const bookings = await Booking.find({
      court: courtId,
      date: {
        $gte: formattedDate,
        $lt: new Date(formattedDate.getTime() + 24 * 60 * 60 * 1000),
      },
      status: { $ne: "cancelled" },
    }).populate("timeSlot");

    // Extract booked time slot IDs
    bookedSlots = bookings.map((booking) => booking.timeSlot._id.toString());
  }

  // Filter out booked slots
  const finalTimeSlots = availableTimeSlots.map((slot) => {
    return {
      ...slot.toObject(),
      isBooked: bookedSlots.includes(slot._id.toString()),
    };
  });

  // Group time slots by section
  const morning = finalTimeSlots.filter((slot) => slot.section === "morning");
  const afternoon = finalTimeSlots.filter(
    (slot) => slot.section === "afternoon"
  );
  const evening = finalTimeSlots.filter((slot) => slot.section === "evening");

  res.status(200).json({
    status: "success",
    data: {
      date: selectedDate,
      morning,
      afternoon,
      evening,
    },
  });
});
