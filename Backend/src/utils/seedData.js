const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Location = require("../models/Location");
const Court = require("../models/Court");
const TimeSlot = require("../models/TimeSlot");

// Load environment variables
dotenv.config();

// Connect to database
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB connection successful for seeding!"))
  .catch((err) => console.error(err));

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({
      phoneNumber: "0000000000",
      role: "admin",
    });

    if (adminExists) {
      console.log("Admin user already exists, skipping...");
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: "admin@eclipse.com",
      phoneNumber: "0000000000",
      role: "admin",
      isVerified: true,
      active: true,
    });

    console.log("Admin user created:", admin);
  } catch (err) {
    console.error("Error creating admin user:", err);
  }
};

// Create locations
const createLocations = async () => {
  try {
    // Check if locations already exist
    const locationsCount = await Location.countDocuments();

    if (locationsCount > 0) {
      console.log("Locations already exist, skipping...");
      return;
    }

    // Create locations
    const locations = await Location.create([
      {
        name: "Eclipse",
        address:
          "Opp. Dream World Residency, G.D. Goenka School Road, Canal Road, Vesu, Surat, Gujarat 395007",
        image: "/src/assets/images/milkyway.jpeg",
        description:
          "Our flagship location with state-of-the-art courts under the stars.",
        status: "active",
        coordinates: {
          lat: 21.1702,
          lng: 72.7684,
        },
        amenities: ["Parking", "Refreshments", "Locker Rooms", "Pro Shop"],
      },
    ]);

    console.log("Locations created:", locations);
    return locations[0]._id;
  } catch (err) {
    console.error("Error creating locations:", err);
  }
};

// Create courts
const createCourts = async (locationId) => {
  try {
    // Check if courts already exist
    const courtsCount = await Court.countDocuments();

    if (courtsCount > 0) {
      console.log("Courts already exist, skipping...");
      return;
    }

    // Create courts
    const courts = await Court.create([
      {
        name: "Court 1",
        location: locationId,
        image: "/images/court.png",
        courtType: "outdoor",
        surface: "hard",
        status: "available",
        pricePerHour: 500,
        features: ["LED Lighting", "Professional Net", "Spectator Seating"],
      },
      {
        name: "Court 2",
        location: locationId,
        image: "/images/court.png",
        courtType: "outdoor",
        surface: "hard",
        status: "available",
        pricePerHour: 500,
        features: ["LED Lighting", "Professional Net", "Spectator Seating"],
      },
      {
        name: "Court 3",
        location: locationId,
        image: "/images/court.png",
        courtType: "outdoor",
        surface: "hard",
        status: "available",
        pricePerHour: 500,
        features: ["LED Lighting", "Professional Net", "Spectator Seating"],
      },
      {
        name: "Court 4",
        location: locationId,
        image: "/images/court.png",
        courtType: "outdoor",
        surface: "hard",
        status: "available",
        pricePerHour: 500,
        features: ["LED Lighting", "Professional Net", "Spectator Seating"],
      },
    ]);

    console.log("Courts created:", courts);
  } catch (err) {
    console.error("Error creating courts:", err);
  }
};

// Create time slots
const createTimeSlots = async () => {
  try {
    // Check if time slots already exist
    const timeSlotsCount = await TimeSlot.countDocuments();

    if (timeSlotsCount > 0) {
      console.log("Time slots already exist, skipping...");
      return;
    }

    // Create morning time slots
    const morningSlots = [
      { startTime: "08:00", endTime: "09:00", section: "morning" },
      { startTime: "09:00", endTime: "10:00", section: "morning" },
      { startTime: "10:00", endTime: "11:00", section: "morning" },
      { startTime: "11:00", endTime: "12:00", section: "morning" },
    ];

    // Create afternoon time slots
    const afternoonSlots = [
      { startTime: "12:00", endTime: "13:00", section: "afternoon" },
      { startTime: "13:00", endTime: "14:00", section: "afternoon" },
      { startTime: "14:00", endTime: "15:00", section: "afternoon" },
      { startTime: "15:00", endTime: "16:00", section: "afternoon" },
    ];

    // Create evening time slots
    const eveningSlots = [
      { startTime: "16:00", endTime: "17:00", section: "evening" },
      { startTime: "17:00", endTime: "18:00", section: "evening" },
      { startTime: "18:00", endTime: "19:00", section: "evening" },
      { startTime: "19:00", endTime: "20:00", section: "evening" },
      { startTime: "20:00", endTime: "21:00", section: "evening" },
    ];

    // Create all time slots
    const timeSlots = await TimeSlot.create([
      ...morningSlots,
      ...afternoonSlots,
      ...eveningSlots,
    ]);

    console.log(`${timeSlots.length} time slots created`);
  } catch (err) {
    console.error("Error creating time slots:", err);
  }
};

// Run all seed functions
const seedAll = async () => {
  try {
    await createAdminUser();
    const locationId = await createLocations();
    if (locationId) {
      await createCourts(locationId);
    }
    await createTimeSlots();

    console.log("All seed data created successfully!");
  } catch (err) {
    console.error("Error seeding data:", err);
  } finally {
    // Disconnect from database
    mongoose.disconnect();
  }
};

// Run seed function
seedAll();
