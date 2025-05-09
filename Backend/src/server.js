const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/database");
const corsOptions = require("./config/cors");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan("dev"));

// Import Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const locationRoutes = require("./routes/location.routes");
const courtRoutes = require("./routes/court.routes");
const timeSlotRoutes = require("./routes/timeSlot.routes");
const bookingRoutes = require("./routes/booking.routes");

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/timeslots", timeSlotRoutes);
app.use("/api/bookings", bookingRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Eclipse Pickleball Court Booking API",
    version: "1.0.0",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message,
    stack:
      process.env.NODE_ENV === "production"
        ? "Error details hidden in production"
        : err.stack,
  });
});

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
