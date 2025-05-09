const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // User information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    // Booking details
    courtNumber: {
      type: Number,
      required: [true, "Court number is required"],
      min: 1,
      max: 7,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },

    // Additional details
    numberOfPlayers: {
      type: Number,
      default: 4,
      min: 1,
      max: 6,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    bookingCode: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate a unique booking code before saving
bookingSchema.pre("save", async function (next) {
  if (!this.bookingCode) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    const charactersLength = characters.length;

    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    this.bookingCode = result;
  }
  next();
});

// Index for faster queries
bookingSchema.index({ date: 1, courtNumber: 1, startTime: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
