import { BookingDetails } from "@/context/BookingContext";
import { API_URL } from "./env";

interface ApiResponse<T> {
  status: string;
  data?: {
    [key: string]: T;
  };
  message?: string;
  results?: number;
}

export interface BookingData {
  _id: string;
  user: {
    _id: string;
    name: string;
    phoneNumber: string;
  };
  court: {
    _id: string;
    name: string;
    location: string;
  };
  courtNumber?: number;
  date: string;
  timeSlot: {
    _id: string;
    startTime: string;
    endTime: string;
    isSpecialEclipseSlot?: boolean;
  };
  startTime?: string;
  endTime?: string;
  status: string;
  numberOfPlayers: number;
  totalPrice: number;
  totalAmount?: number;
  paymentStatus: string;
  notes?: string;
  bookingCode: string;
  createdAt: string;
  updatedAt: string;
}

// Add this helper function at the top of the file, after the imports
const determinePrice = (timeString: string): number => {
  // Special cases for Eclipse/Midnight slot
  if (timeString === "Midnight" || timeString === "Eclipse") {
    return 900; // Use evening price for Midnight/Eclipse
  }

  // Extract hours from time string (assuming format like "2:00 PM" or "14:00")
  let hours = 0;
  if (timeString.includes(":")) {
    if (timeString.includes("PM") && !timeString.includes("12:")) {
      // PM times (except 12 PM)
      hours = parseInt(timeString.split(":")[0]) + 12;
    } else if (timeString.includes("AM") && timeString.includes("12:")) {
      // 12 AM special case
      hours = 0;
    } else {
      // All other times - just parse the hours
      hours = parseInt(timeString.split(":")[0]);
    }
  }

  // Evening: 5 PM (17:00) onwards - ₹900
  if (hours >= 17) {
    return 900;
  }
  // Morning and Afternoon - ₹600
  return 600;
};

// Create a booking
export const createBooking = async (
  phoneNumber: string,
  name: string,
  courtNumber: string,
  date: string | Date,
  timeSlotString: string,
  numberOfPlayers: number = 4,
  notes: string = "",
  totalAmount: number | null = null,
  isEclipseSlot: boolean = false
): Promise<any> => {
  try {
    console.log("Creating booking with details:", {
      phoneNumber,
      name,
      courtNumber,
      date,
      timeSlotString,
      numberOfPlayers,
      notes,
      totalAmount,
      isEclipseSlot,
    });

    // For Eclipse slots, use "Midnight" directly
    let startTime: string, endTime: string;

    if (isEclipseSlot) {
      startTime = "Midnight";
      endTime = "";
    } else {
      // For regular slots, split the timeSlotString
      startTime = timeSlotString.split("-")[0].trim();
      endTime = timeSlotString.includes("-")
        ? timeSlotString.split("-")[1].trim()
        : "";
    }

    const response = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        name,
        courtNumber,
        date,
        startTime,
        endTime,
        numberOfPlayers,
        notes,
        totalAmount,
        isEclipseSlot,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create booking");
    }

    const result = await response.json();
    return result.data?.booking;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

// Get bookings for a user
export const getUserBookings = async (
  phoneNumber: string
): Promise<BookingData[]> => {
  try {
    const response = await fetch(`${API_URL}/bookings/user/${phoneNumber}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user bookings");
    }

    const result: ApiResponse<BookingData[]> = await response.json();

    // Transform the bookings to ensure they have the expected structure
    const bookings = result.data?.bookings || [];

    return bookings.map((booking) => {
      // Ensure court object exists
      if (!booking.court) {
        booking.court = {
          _id: booking._id,
          name: String(booking.courtNumber || ""),
          location: "Eclipse Pickleball",
        };
      }

      // Ensure timeSlot object exists
      if (!booking.timeSlot) {
        booking.timeSlot = {
          _id: booking._id,
          startTime: booking.startTime || "",
          endTime: booking.endTime || "",
        };
      }

      // Check if this is the special Eclipse slot
      const isEclipseSlot =
        booking.timeSlot.isSpecialEclipseSlot ||
        booking.timeSlot.startTime === "Eclipse" ||
        booking.timeSlot.startTime === "Midnight";

      return {
        ...booking,
        totalPrice:
          booking.totalPrice || determinePrice(booking.startTime || ""),
        totalAmount:
          booking.totalAmount ||
          booking.totalPrice ||
          determinePrice(booking.startTime || ""),
      };
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
};

// Get booking by ID
export const getBookingById = async (
  bookingId: string
): Promise<BookingData> => {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch booking");
    }

    const result: ApiResponse<BookingData> = await response.json();
    return result.data?.booking as BookingData;
  } catch (error) {
    console.error("Error fetching booking:", error);
    throw error;
  }
};

// Get booked courts for a specific date and time slot
export const getBookedCourts = async (
  date: string,
  timeSlotId: string,
  isSpecialEclipseSlot: boolean = false
): Promise<string[]> => {
  try {
    // Handle potentially invalid date
    let formattedDate;
    try {
      formattedDate = new Date(date).toISOString();
    } catch (error) {
      console.error("Invalid date format:", date);
      // Use current date as fallback
      formattedDate = new Date().toISOString();
    }

    // Ensure timeSlotId is properly formatted
    const encodedTimeSlotId = encodeURIComponent(timeSlotId);

    console.log(
      `Requesting availability with date=${formattedDate} and timeSlotId=${encodedTimeSlotId}, isSpecialEclipseSlot=${isSpecialEclipseSlot}`
    );

    // Add a timeout to the fetch to prevent long-hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    // Build the URL with the eclipse parameter if needed
    let url = `${API_URL}/bookings/availability?date=${formattedDate}&timeSlotId=${encodedTimeSlotId}`;
    if (isSpecialEclipseSlot) {
      url += "&isSpecialEclipseSlot=true";
    }

    try {
      const response = await fetch(url, { signal: controller.signal });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Court availability error:", errorData.message);

        // Handle specific error cases
        if (
          errorData.message &&
          (errorData.message.includes("Invalid time slot ID format") ||
            errorData.message.includes("Time slot not found"))
        ) {
          console.warn(
            "Time slot issue detected, proceeding with empty booked courts list"
          );
          // Return empty array to avoid blocking the user
          return [];
        }

        throw new Error(
          errorData.message || "Failed to fetch court availability"
        );
      }

      const result: ApiResponse<string[]> = await response.json();
      console.log(
        "Successfully retrieved court availability:",
        result.data?.bookedCourts || []
      );
      return result.data?.bookedCourts || [];
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        console.error("Request timeout when fetching court availability");
      } else {
        console.error("Error fetching booked courts:", error);
      }
      return []; // Return empty array on error to be safe
    }
  } catch (error) {
    console.error("Error in getBookedCourts:", error);
    return []; // Return empty array on error to be safe
  }
};
