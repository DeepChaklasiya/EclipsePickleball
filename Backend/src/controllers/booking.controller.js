const Booking = require("../models/Booking");
const User = require("../models/User");
const Court = require("../models/Court");
const TimeSlot = require("../models/TimeSlot");
const Location = require("../models/Location");

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      phoneNumber,
      name,
      courtId,
      date,
      timeSlotId,
      numberOfPlayers = 4,
      notes,
      paymentStatus = "pay-at-court",
    } = req.body;

    console.log("Received booking request:", req.body);

    // Find user by phone number
    let user = await User.findOne({ phoneNumber });

    // If user doesn't exist, create a new one
    if (!user) {
      user = await User.create({
        phoneNumber,
        name,
        isVerified: true,
      });
    }

    // For mock/test environment, create court and timeslot if they don't exist
    let court;
    let timeSlot;

    try {
      // Try to find court by ID or by name
      // First try direct ID lookup
      court = await Court.findById(courtId).catch(() => null);

      // If not found, try to find by name (for simple numeric IDs like "1", "2", etc.)
      if (!court) {
        court = await Court.findOne({ name: `Court ${courtId}` });
      }

      // If still not found, try a numeric approach
      if (!court) {
        // Try to find courts and select by index
        const courts = await Court.find().sort({ name: 1 });
        const courtIndex = parseInt(courtId) - 1; // Convert to 0-based index

        if (
          courts.length > 0 &&
          courtIndex >= 0 &&
          courtIndex < courts.length
        ) {
          court = courts[courtIndex];
        }
      }

      // If court still not found, create a new court
      if (!court) {
        // Find or create a location
        let location =
          (await Location.findOne()) ||
          (await Location.create({
            name: "Eclipse Vesu",
            address: "Vesu, Surat",
            coordinates: {
              lat: 21.14177,
              lng: 72.76826,
            },
            status: "active",
          }));

        // Create court
        court = await Court.create({
          name: `Court ${courtId}`,
          location: location._id,
          courtType: "outdoor",
          status: "available",
          pricePerHour: 800,
          active: true,
        });
        console.log("Created new court:", court);
      }
    } catch (error) {
      console.error("Error with court:", error);
      return res.status(400).json({
        status: "error",
        message: "Could not process court information",
        details: error.message,
      });
    }

    try {
      // Try to find timeSlot by ID or parse from string
      let startTime, endTime, section;

      if (typeof timeSlotId === "string") {
        // Handle malformed time format "10:00 AM-" with missing end time
        if (timeSlotId.endsWith("-")) {
          timeSlotId = timeSlotId.slice(0, -1);

          // Try to parse the time, handling AM/PM format
          if (timeSlotId.includes("AM") || timeSlotId.includes("PM")) {
            // Convert from 12-hour to 24-hour format
            const timeComponents = timeSlotId.trim().split(" ");
            const timeParts = timeComponents[0].split(":");
            let hours = parseInt(timeParts[0]);
            const minutes = timeParts[1] || "00";

            // Apply AM/PM conversion
            if (timeComponents[1] === "PM" && hours < 12) {
              hours += 12;
            } else if (timeComponents[1] === "AM" && hours === 12) {
              hours = 0;
            }

            // Format to 24-hour time
            startTime = `${hours.toString().padStart(2, "0")}:${minutes}`;

            // Set end time to one hour after start time
            const nextHour = (hours + 1) % 24;
            endTime = `${nextHour.toString().padStart(2, "0")}:${minutes}`;
          } else {
            // Already in 24-hour format
            startTime = timeSlotId.trim();

            // Calculate end time (1 hour later)
            const hourPart = parseInt(startTime.split(":")[0]);
            const minutePart = startTime.split(":")[1] || "00";
            const nextHour = (hourPart + 1) % 24;
            endTime = `${nextHour.toString().padStart(2, "0")}:${minutePart}`;
          }
        }
        // Handle format like "08:00-09:00"
        else if (timeSlotId.includes("-")) {
          const parts = timeSlotId.split("-");
          startTime = parts[0].trim();
          endTime = parts[1].trim() || "";

          // If endTime is empty or invalid, set it to one hour after start time
          if (!endTime || endTime === "") {
            // Parse the hour and increment it
            const hourPart = parseInt(startTime.split(":")[0]);
            const minutePart = startTime.split(":")[1] || "00";
            const nextHour = (hourPart + 1) % 24;
            endTime = `${nextHour.toString().padStart(2, "0")}:${minutePart}`;
          }

          // If time includes AM/PM, convert to 24-hour format
          if (startTime.includes("AM") || startTime.includes("PM")) {
            // Convert start time
            const startTimeComponents = startTime.split(" ");
            const startTimeParts = startTimeComponents[0].split(":");
            let startHours = parseInt(startTimeParts[0]);
            const startMinutes = startTimeParts[1] || "00";

            if (startTimeComponents[1] === "PM" && startHours < 12) {
              startHours += 12;
            } else if (startTimeComponents[1] === "AM" && startHours === 12) {
              startHours = 0;
            }

            startTime = `${startHours
              .toString()
              .padStart(2, "0")}:${startMinutes}`;
          }

          if (endTime.includes("AM") || endTime.includes("PM")) {
            // Convert end time
            const endTimeComponents = endTime.split(" ");
            const endTimeParts = endTimeComponents[0].split(":");
            let endHours = parseInt(endTimeParts[0]);
            const endMinutes = endTimeParts[1] || "00";

            if (endTimeComponents[1] === "PM" && endHours < 12) {
              endHours += 12;
            } else if (endTimeComponents[1] === "AM" && endHours === 12) {
              endHours = 0;
            }

            endTime = `${endHours.toString().padStart(2, "0")}:${endMinutes}`;
          }
        }
        // Handle section-based format like "m5", "a2", "e3"
        else if (timeSlotId.match(/^[mae][0-9]+$/i)) {
          const section = timeSlotId.charAt(0).toLowerCase();
          const slotNumber = parseInt(timeSlotId.substring(1));

          let baseHour = 0;

          // Determine section and base hour
          if (section === "m") {
            sectionName = "morning";
            baseHour = 6; // Morning slots start at 6am
          } else if (section === "a") {
            sectionName = "afternoon";
            baseHour = 12; // Afternoon slots start at 12pm
          } else if (section === "e") {
            sectionName = "evening";
            baseHour = 16; // Evening slots start at 4pm
          }

          // Calculate the hour based on slot number (each slot is 1 hour)
          const hour = baseHour + (slotNumber - 1);
          const nextHour = hour + 1;

          // Format times with leading zeros
          startTime = `${hour.toString().padStart(2, "0")}:00`;
          endTime = `${nextHour.toString().padStart(2, "0")}:00`;
        }
        // Just a single time provided, assume 1-hour slot
        else {
          startTime = timeSlotId.trim();

          // Handle AM/PM format
          if (startTime.includes("AM") || startTime.includes("PM")) {
            const timeComponents = startTime.split(" ");
            const timeParts = timeComponents[0].split(":");
            let hours = parseInt(timeParts[0]);
            const minutes = timeParts[1] || "00";

            // Apply AM/PM conversion
            if (timeComponents[1] === "PM" && hours < 12) {
              hours += 12;
            } else if (timeComponents[1] === "AM" && hours === 12) {
              hours = 0;
            }

            startTime = `${hours.toString().padStart(2, "0")}:${minutes}`;
          }

          // Calculate end time (1 hour later)
          const hourPart = parseInt(startTime.split(":")[0]);
          const minutePart = startTime.split(":")[1] || "00";
          const nextHour = (hourPart + 1) % 24;
          endTime = `${nextHour.toString().padStart(2, "0")}:${minutePart}`;
        }
      } else {
        // Default values if all else fails
        startTime = "08:00";
        endTime = "09:00";
      }

      console.log(
        `Processed time values - startTime: ${startTime}, endTime: ${endTime}`
      );

      // Try to find existing time slot
      try {
        // Only attempt to find by ID if it's a valid MongoDB ObjectId
        if (timeSlotId && timeSlotId.match(/^[0-9a-fA-F]{24}$/)) {
          timeSlot = await TimeSlot.findById(timeSlotId);
        }
      } catch (err) {
        console.log(
          "Error finding time slot by ID, will try by start time:",
          err.message
        );
      }

      // If not found by ID, try by start time
      if (!timeSlot) {
        timeSlot = await TimeSlot.findOne({ startTime });
      }

      if (!timeSlot) {
        // Create time slot if not found
        // Determine section based on time
        const hour = parseInt(startTime.split(":")[0]);
        if (hour < 12) {
          section = "morning";
        } else if (hour < 16) {
          section = "afternoon";
        } else {
          section = "evening";
        }

        timeSlot = await TimeSlot.create({
          startTime,
          endTime,
          section,
          active: true,
        });
        console.log("Created new timeSlot:", timeSlot);
      }
    } catch (error) {
      console.error("Error with time slot:", error);
      return res.status(400).json({
        status: "error",
        message: "Could not process time slot information",
        details: error.message,
      });
    }

    // Create booking
    const booking = await Booking.create({
      user: user._id,
      court: court._id,
      date: new Date(date),
      timeSlot: timeSlot._id,
      numberOfPlayers,
      totalPrice: 800,
      notes,
      paymentStatus: "pay-at-court",
      status: "confirmed",
    });

    // Populate related data
    await booking.populate([
      { path: "user", select: "name phoneNumber" },
      { path: "court" },
      { path: "timeSlot" },
    ]);

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

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Find all bookings for this user
    const bookings = await Booking.find({ user: user._id })
      .populate("court")
      .populate("timeSlot")
      .sort({ date: -1 }); // Most recent first

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
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name phoneNumber")
      .populate("court")
      .populate("timeSlot");

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

// Get booked courts for a specific date and time slot
exports.getBookedCourts = async (req, res) => {
  try {
    const { date, timeSlotId } = req.query;

    console.log("Checking availability for:", { date, timeSlotId });

    if (!date || !timeSlotId) {
      return res.status(400).json({
        status: "error",
        message: "Date and timeSlotId are required",
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

    // Find time slot
    let timeSlot;
    let virtualTimeSlot = false;

    try {
      // First try: check if it's a valid MongoDB ID
      if (timeSlotId.match(/^[0-9a-fA-F]{24}$/)) {
        timeSlot = await TimeSlot.findById(timeSlotId);
        console.log(
          "Looking up by MongoDB ID: ",
          timeSlot ? "Found" : "Not found"
        );
      }

      // Second try: check if it's a time range format like "08:00-09:00"
      if (
        !timeSlot &&
        typeof timeSlotId === "string" &&
        timeSlotId.includes("-")
      ) {
        const startTime = timeSlotId.split("-")[0].trim();
        console.log("Looking for time slot with startTime:", startTime);
        timeSlot = await TimeSlot.findOne({ startTime });
        console.log(
          "Looking up by startTime: ",
          timeSlot ? "Found" : "Not found"
        );
      }

      // Special handling for custom format like "m5", "a2", "e3" (morning 5, afternoon 2, evening 3)
      if (
        !timeSlot &&
        typeof timeSlotId === "string" &&
        timeSlotId.match(/^[mae][0-9]+$/i)
      ) {
        console.log("Handling custom time slot format:", timeSlotId);

        // Parse the format: First letter (m/a/e) indicates section, number indicates slot
        const section = timeSlotId.charAt(0).toLowerCase();
        const slotNumber = parseInt(timeSlotId.substring(1));

        let sectionName = "";
        let baseHour = 0;

        // Determine section and base hour
        if (section === "m") {
          sectionName = "morning";
          baseHour = 6; // Morning slots start at 6am
        } else if (section === "a") {
          sectionName = "afternoon";
          baseHour = 12; // Afternoon slots start at 12pm
        } else if (section === "e") {
          sectionName = "evening";
          baseHour = 16; // Evening slots start at 4pm
        }

        // Calculate the hour based on slot number (each slot is 1 hour)
        const hour = baseHour + (slotNumber - 1);
        const nextHour = hour + 1;

        // Format times with leading zeros
        const startTime = `${hour.toString().padStart(2, "0")}:00`;
        const endTime = `${nextHour.toString().padStart(2, "0")}:00`;

        console.log(
          `Converted ${timeSlotId} to ${startTime}-${endTime} (${sectionName})`
        );

        // Look for time slot with this start time and section
        timeSlot = await TimeSlot.findOne({
          startTime,
          section: sectionName,
        });

        console.log(
          "Looking up by custom format: ",
          timeSlot ? "Found" : "Not found"
        );

        // If not found, create a virtual time slot
        if (!timeSlot) {
          timeSlot = {
            _id: `virtual_${sectionName}_${slotNumber}`,
            startTime,
            endTime,
            section: sectionName,
            active: true,
          };
          virtualTimeSlot = true;
          console.log(
            "Created virtual time slot from custom format:",
            timeSlot
          );
        }
      }

      // Third try: create a temporary time slot if needed for checking availability
      if (
        !timeSlot &&
        typeof timeSlotId === "string" &&
        timeSlotId.includes("-")
      ) {
        console.log("Time slot not found in database, using virtual time slot");
        const [startTime, endTime] = timeSlotId.split("-").map((t) => t.trim());

        // Determine section based on time
        let section = "morning";
        let hour = 0;

        // Handle different time formats
        if (startTime.includes(":")) {
          hour = parseInt(startTime.split(":")[0]);
        } else {
          hour = parseInt(startTime);
        }

        if (hour >= 12 && hour < 16) {
          section = "afternoon";
        } else if (hour >= 16) {
          section = "evening";
        }

        // Use a virtual time slot (not saved to database)
        timeSlot = {
          _id: `virtual_${startTime.replace(/:/g, "")}_${endTime.replace(
            /:/g,
            ""
          )}`,
          startTime: startTime,
          endTime: endTime || `${(hour + 1).toString().padStart(2, "0")}:00`,
          section,
          active: true,
        };
        virtualTimeSlot = true;
        console.log("Created virtual time slot:", timeSlot);
      }

      // Last try: default time slot as fallback
      if (!timeSlot) {
        console.log("Using default time slot as fallback");
        // Create a default time slot (9am-10am) to prevent errors
        timeSlot = {
          _id: "virtual_default_slot",
          startTime: "09:00",
          endTime: "10:00",
          section: "morning",
          active: true,
        };
        virtualTimeSlot = true;
        console.log("Created default virtual time slot:", timeSlot);
      }
    } catch (error) {
      console.error("Error finding time slot:", error);
      return res.status(400).json({
        status: "error",
        message: "Invalid time slot ID format",
      });
    }

    console.log("Using time slot:", timeSlot);

    // Set date range for the query (the full day)
    const startDate = new Date(sanitizedDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(sanitizedDate);
    endDate.setHours(23, 59, 59, 999);

    // Find bookings for the specified date and time
    let bookedCourts = [];

    // If using a virtual time slot, try to find by start time
    if (virtualTimeSlot) {
      // Try to find time slots with matching start time
      const matchingTimeSlots = await TimeSlot.find({
        startTime: { $regex: new RegExp(`^${timeSlot.startTime}`) },
      });

      console.log(
        `Found ${matchingTimeSlots.length} matching time slots by start time`
      );

      if (matchingTimeSlots.length > 0) {
        // Get all bookings for these time slots
        const timeSlotIds = matchingTimeSlots.map((ts) => ts._id);

        const bookingsByStartTime = await Booking.find({
          date: {
            $gte: startDate,
            $lt: endDate,
          },
          timeSlot: { $in: timeSlotIds },
          status: { $ne: "cancelled" },
        });

        console.log(
          `Found ${bookingsByStartTime.length} bookings for matching time slots`
        );
        bookedCourts = bookingsByStartTime.map((booking) =>
          booking.court.toString()
        );
      } else {
        // No matching time slots found, return empty array
        console.log("No matching time slots found in database");
        bookedCourts = [];
      }
    } else {
      // Using a real time slot from the database
      const bookings = await Booking.find({
        date: {
          $gte: startDate,
          $lt: endDate,
        },
        timeSlot: timeSlot._id,
        status: { $ne: "cancelled" }, // Exclude cancelled bookings
      });

      console.log(`Found ${bookings.length} bookings for time slot`);

      // Extract the court IDs from the bookings
      bookedCourts = bookings.map((booking) => booking.court.toString());
    }

    console.log("Booked courts:", bookedCourts);

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
