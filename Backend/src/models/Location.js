const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Location address is required"],
      trim: true,
    },
    image: {
      type: String,
      default: "/images/default-location.jpg",
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "coming-soon", "closed"],
      default: "active",
    },
    coordinates: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
    amenities: [String],
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

// Virtual field for courts
locationSchema.virtual("courts", {
  ref: "Court",
  foreignField: "location",
  localField: "_id",
});

const Location = mongoose.model("Location", locationSchema);

module.exports = Location;
