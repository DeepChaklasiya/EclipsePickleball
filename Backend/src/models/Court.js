const mongoose = require("mongoose");

const courtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Court name is required"],
      trim: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: [true, "Court must belong to a location"],
    },
    image: {
      type: String,
      default: "/images/court.png",
    },
    courtType: {
      type: String,
      enum: ["indoor", "outdoor"],
      default: "outdoor",
    },
    status: {
      type: String,
      enum: ["available", "maintenance", "closed"],
      default: "available",
    },
    pricePerHour: {
      type: Number,
      required: [true, "Price per hour is required"],
      default: 800,
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

// Virtual field for bookings
courtSchema.virtual("bookings", {
  ref: "Booking",
  foreignField: "court",
  localField: "_id",
});

const Court = mongoose.model("Court", courtSchema);

module.exports = Court;
