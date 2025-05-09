const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Booking must belong to a user"],
    },
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Court",
      required: [true, "Booking must belong to a court"],
    },
    date: {
      type: Date,
      required: [true, "Booking date is required"],
    },
    timeSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeSlot",
      required: [true, "Booking must have a time slot"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    numberOfPlayers: {
      type: Number,
      required: [true, "Number of players is required"],
      min: 1,
      max: 4,
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "pay-at-court"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
    bookingCode: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate unique booking code before saving
bookingSchema.pre("save", async function (next) {
  if (this.isNew || !this.bookingCode) {
    const timestamp = Math.floor(Date.now() / 1000).toString(36);
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    this.bookingCode = `EP-${timestamp}-${random}`;
  }
  next();
});

// Indexes for faster queries
bookingSchema.index({ date: 1, timeSlot: 1, court: 1 }, { unique: true });
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
