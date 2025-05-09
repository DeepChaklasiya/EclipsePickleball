const Booking = require("../models/Booking");

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      courtNumber,
      date,
      startTime,
      endTime,
      numberOfPlayers = 4,
      notes,
    } = req.body;

    console.log("Received booking request:", req.body);

    // Validate required fields
    if (
      !name ||
      !phoneNumber ||
      !courtNumber ||
      !date ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        status: "error",
        message: "Missing required booking information",
      });
    }

    // Format startTime and endTime to include AM/PM in IST
    const formatTimeToIST = (timeString) => {
      // If already has AM/PM, return as is
      if (timeString.includes("AM") || timeString.includes("PM")) {
        return timeString;
      }

      // Extract hours from time (assuming 24-hour format like "14:00")
      let [hours, minutes] = timeString.split(":");
      hours = parseInt(hours);

      // Convert to 12-hour format with AM/PM
      const period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12; // Convert 0 to 12 for 12 AM

      return `${hours}:${minutes} ${period}`;
    };

    const formattedStartTime = formatTimeToIST(startTime);
    const formattedEndTime = formatTimeToIST(endTime);

    console.log(
      `Formatted times: ${formattedStartTime} to ${formattedEndTime} (IST)`
    );

    // Convert courtNumber if needed based on frontend display
    // In frontend, Court 1 is displayed for the 7th court (index 6), Court 2 for the 6th court, etc.
    // This ensures the court number stored matches what the user sees in the UI
    let normalizedCourtNumber = courtNumber;

    // If courtNumber is a string with just a number 1-7
    if (typeof courtNumber === "string" && /^[1-7]$/.test(courtNumber)) {
      // Convert to number that matches the display in frontend
      // This handles the reverse order display where Court 1 is actually the 7th court
      normalizedCourtNumber = 8 - parseInt(courtNumber);
      console.log(
        `Normalized court number from ${courtNumber} to ${normalizedCourtNumber} to match frontend display`
      );
    }

    // Check if the court is already booked for this time
    const existingBooking = await Booking.findOne({
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
      },
      courtNumber: normalizedCourtNumber,
      startTime: formattedStartTime,
      status: "confirmed",
    });

    if (existingBooking) {
      return res.status(400).json({
        status: "error",
        message: "This court is already booked for the selected time",
      });
    }

    // Create booking with IST formatted times
    const booking = await Booking.create({
      name,
      phoneNumber,
      courtNumber: normalizedCourtNumber, // Use the normalized court number
      date: new Date(date),
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      numberOfPlayers,
      notes,
      status: "confirmed",
    });

    res.status(201).json({
      status: "success",
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get all bookings for a user by phone number
exports.getUserBookings = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({
        status: "error",
        message: "Phone number is required",
      });
    }

    // Find all bookings for this user
    const bookings = await Booking.find({
      phoneNumber,
      status: "confirmed",
    }).sort({ date: -1 }); // Most recent first

    res.status(200).json({
      status: "success",
      results: bookings.length,
      data: {
        bookings,
      },
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get booking by ID
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Booking not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get booked courts for a specific date and time
exports.getBookedCourts = async (req, res) => {
  try {
    const { date, timeSlotId, startTime: rawStartTime } = req.query;

    console.log("Checking availability for:", {
      date,
      timeSlotId,
      rawStartTime,
    });

    if (!date) {
      return res.status(400).json({
        status: "error",
        message: "Date is required",
      });
    }

    // Sanitize and fix incoming data
    const sanitizedDate = new Date(date);
    if (isNaN(sanitizedDate.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    // Determine the startTime - either directly provided or from timeSlotId
    let startTime = rawStartTime;

    // If timeSlotId is provided in the format 'm1', 'a2', 'e3', etc.
    if (timeSlotId && !startTime) {
      // Parse the timeSlotId format
      if (
        typeof timeSlotId === "string" &&
        timeSlotId.match(/^[mae][0-9]+$/i)
      ) {
        console.log("Found timeSlotId format:", timeSlotId);

        const section = timeSlotId.charAt(0).toLowerCase();
        const slotNumber = parseInt(timeSlotId.substring(1));

        let baseHour = 0;

        // Determine section and base hour
        if (section === "m") {
          // Morning slots start at 6am
          baseHour = 6;
        } else if (section === "a") {
          // Afternoon slots start at 12pm
          baseHour = 12;
        } else if (section === "e") {
          // Evening slots start at 4pm
          baseHour = 16;
        }

        // Calculate the hour based on slot number (each slot is 1 hour)
        const hour = baseHour + (slotNumber - 1);

        // Format time with leading zeros
        startTime = `${hour.toString().padStart(2, "0")}:00`;
        console.log("Converted timeSlotId to startTime:", startTime);
      } else if (timeSlotId.includes("-")) {
        // If it's a range like "08:00-09:00", extract the first part
        startTime = timeSlotId.split("-")[0].trim();
        console.log("Extracted startTime from range:", startTime);
      } else {
        // If it's just a time
        startTime = timeSlotId;
      }
    }

    if (!startTime) {
      return res.status(400).json({
        status: "error",
        message: "Either startTime or valid timeSlotId is required",
      });
    }

    // Set date range for the query (the full day)
    const startDate = new Date(sanitizedDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(sanitizedDate);
    endDate.setHours(23, 59, 59, 999);

    console.log("Using startTime for query:", startTime);

    // Find bookings for the specified date and time
    const bookings = await Booking.find({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
      startTime: startTime,
      status: "confirmed",
    });

    console.log(`Found ${bookings.length} bookings for date and time`);

    // Extract the court numbers from the bookings and convert them back to frontend display format
    const bookedCourts = bookings.map((booking) => {
      // Convert backend court number (stored in DB) to frontend display court number
      // If the backend has court 7, frontend displays it as Court 1, etc.
      const courtNum = parseInt(booking.courtNumber);
      if (!isNaN(courtNum) && courtNum >= 1 && courtNum <= 7) {
        // Use the same conversion formula: 8 - courtNumber
        return (8 - courtNum).toString();
      }
      return booking.courtNumber.toString();
    });

    console.log("Booked courts (converted to frontend display):", bookedCourts);

    res.status(200).json({
      status: "success",
      data: {
        bookedCourts,
      },
    });
  } catch (error) {
    console.error("Get booked courts error:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Booking not found",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      status: "success",
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
