const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      trim: true,
    },
    section: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      required: [true, "Section is required"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    daysAvailable: {
      type: [Number], // 0 = Sunday, 1 = Monday, etc.
      default: [0, 1, 2, 3, 4, 5, 6], // Default available all days
    },
    capacity: {
      type: Number,
      default: 4,
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

// Method to check if time slot is available for a specific date
timeSlotSchema.methods.isAvailableForDate = function (date) {
  const dayOfWeek = date.getDay();
  return this.daysAvailable.includes(dayOfWeek) && this.isAvailable;
};

const TimeSlot = mongoose.model("TimeSlot", timeSlotSchema);

module.exports = TimeSlot;
