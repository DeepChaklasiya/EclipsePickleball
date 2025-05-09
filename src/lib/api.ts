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
  };
  startTime?: string;
  endTime?: string;
  status: string;
  numberOfPlayers: number;
  totalPrice: number;
  paymentStatus: string;
  notes?: string;
  bookingCode: string;
  createdAt: string;
  updatedAt: string;
}

// Create a booking
export const createBooking = async (
  phoneNumber: string,
  name: string,
  courtNumber: string,
  date: string | Date,
  timeSlotString: string,
  numberOfPlayers: number = 4,
  notes: string = ""
): Promise<any> => {
  try {
    // Format date to ISO string
    const formattedDate = new Date(date).toISOString();

    // Extract start and end times from timeSlotId
    let startTime = "08:00";
    let endTime = "09:00";

    if (timeSlotString.includes("-")) {
      const [start, end] = timeSlotString.split("-");
      startTime = start.trim();
      endTime = end.trim();
    }

    // Format times to include AM/PM in IST
    const formatTimeToIST = (timeString: string) => {
      // If already has AM/PM, return as is
      if (timeString.includes("AM") || timeString.includes("PM")) {
        return timeString;
      }

      // Extract hours from time (assuming 24-hour format like "14:00")
      let [hours, minutes] = timeString.split(":");
      const hoursNum = parseInt(hours);

      // Convert to 12-hour format with AM/PM
      const period = hoursNum >= 12 ? "PM" : "AM";
      const hours12 = hoursNum % 12 || 12; // Convert 0 to 12 for 12 AM

      return `${hours12}:${minutes} ${period}`;
    };

    const formattedStartTime = formatTimeToIST(startTime);
    const formattedEndTime = formatTimeToIST(endTime);

    console.log(
      `Creating booking with IST times: ${formattedStartTime} to ${formattedEndTime}`
    );

    const response = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        name,
        courtNumber,
        date: formattedDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        numberOfPlayers,
        notes,
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

      return {
        ...booking,
        totalPrice: booking.totalPrice || 800,
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
  timeSlotId: string
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
      `Requesting availability with date=${formattedDate} and timeSlotId=${encodedTimeSlotId}`
    );

    // Add a timeout to the fetch to prevent long-hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(
        `${API_URL}/bookings/availability?date=${formattedDate}&timeSlotId=${encodedTimeSlotId}`,
        { signal: controller.signal }
      );

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
