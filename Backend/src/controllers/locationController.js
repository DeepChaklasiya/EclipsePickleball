const Location = require("../models/Location");
const { AppError, catchAsync } = require("../utils/errorHandler");

// Get all locations
exports.getAllLocations = catchAsync(async (req, res, next) => {
  const locations = await Location.find({ active: true });

  res.status(200).json({
    status: "success",
    results: locations.length,
    data: {
      locations,
    },
  });
});

// Get location by ID
exports.getLocation = catchAsync(async (req, res, next) => {
  const location = await Location.findById(req.params.id).populate("courts");

  if (!location) {
    return next(new AppError("No location found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      location,
    },
  });
});

// Create new location (admin only)
exports.createLocation = catchAsync(async (req, res, next) => {
  const newLocation = await Location.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      location: newLocation,
    },
  });
});

// Update location (admin only)
exports.updateLocation = catchAsync(async (req, res, next) => {
  const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!location) {
    return next(new AppError("No location found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      location,
    },
  });
});

// Delete location (admin only)
exports.deleteLocation = catchAsync(async (req, res, next) => {
  // Soft delete by setting active to false
  const location = await Location.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true }
  );

  if (!location) {
    return next(new AppError("No location found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
