const Court = require("../models/Court");
const { AppError, catchAsync } = require("../utils/errorHandler");

// Get all courts
exports.getAllCourts = catchAsync(async (req, res, next) => {
  // Filter by location if provided
  const filter = {};
  if (req.query.location) {
    filter.location = req.query.location;
  }

  // Only return active courts
  filter.active = true;

  // Find courts
  const courts = await Court.find(filter).populate("location");

  res.status(200).json({
    status: "success",
    results: courts.length,
    data: {
      courts,
    },
  });
});

// Get court by ID
exports.getCourt = catchAsync(async (req, res, next) => {
  const court = await Court.findById(req.params.id).populate("location");

  if (!court) {
    return next(new AppError("No court found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      court,
    },
  });
});

// Create new court (admin only)
exports.createCourt = catchAsync(async (req, res, next) => {
  const newCourt = await Court.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      court: newCourt,
    },
  });
});

// Update court (admin only)
exports.updateCourt = catchAsync(async (req, res, next) => {
  const court = await Court.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!court) {
    return next(new AppError("No court found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      court,
    },
  });
});

// Delete court (admin only)
exports.deleteCourt = catchAsync(async (req, res, next) => {
  // Soft delete by setting active to false
  const court = await Court.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true }
  );

  if (!court) {
    return next(new AppError("No court found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
