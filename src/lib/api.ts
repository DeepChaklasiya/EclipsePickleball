import { BookingDetails } from "@/context/BookingContext";

const API_URL = "http://localhost:5000/api";

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
  date: string;
  timeSlot: {
    _id: string;
    startTime: string;
    endTime: string;
  };
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
  courtId: string,
  date: string | Date,
  timeSlotId: string,
  numberOfPlayers: number = 4,
  notes: string = "",
  paymentStatus: string = "pay-at-court"
): Promise<any> => {
  try {
    // Format date to ISO string
    const formattedDate = new Date(date).toISOString();

    // Format the timeSlotId to a consistent format that the backend can handle
    let formattedTimeSlotId = timeSlotId;

    // Validate and fix time format issues
    try {
      if (timeSlotId.includes("-")) {
        // Check for formats like "10:00 AM-" or "08:00-" with missing end time
        const parts = timeSlotId.split("-");

        // If the second part is empty or missing, fix it
        if (!parts[1] || parts[1].trim() === "") {
          // Extract the start time and compute an end time (1 hour later)
          const startTimePart = parts[0].trim();

          if (startTimePart.includes("AM") || startTimePart.includes("PM")) {
            // Handle 12-hour format
            const timeParts = startTimePart.split(" ");
            const time = timeParts[0];
            const ampm = timeParts[1];

            // Extract hour and minute
            let hourNum = 0;
            let minute = "00";

            if (time.includes(":")) {
              const [hour, min] = time.split(":");
              hourNum = parseInt(hour);
              minute = min || "00";
            } else {
              // Handle case where there's just a number without minutes
              hourNum = parseInt(time);
              minute = "00";
            }

            // Ensure hour is a valid number
            if (isNaN(hourNum)) {
              hourNum = 8; // Default to 8am if parsing fails
              console.warn(`Invalid hour format: ${time}, defaulting to 8`);
            }

            // Adjust hour for AM/PM
            if (ampm === "PM" && hourNum < 12) hourNum += 12;
            else if (ampm === "AM" && hourNum === 12) hourNum = 0;

            // Ensure hour is between 0-23
            hourNum = Math.max(0, Math.min(23, hourNum));

            // Calculate end hour (1 hour later)
            const endHour = (hourNum + 1) % 24;

            // Format in 24-hour time for backend
            formattedTimeSlotId = `${hourNum
              .toString()
              .padStart(2, "0")}:${minute}-${endHour
              .toString()
              .padStart(2, "0")}:${minute}`;
          } else {
            // Handle 24-hour format
            let hourNum = 0;
            let minute = "00";

            if (startTimePart.includes(":")) {
              const [hour, min] = startTimePart.split(":");
              hourNum = parseInt(hour);
              minute = min || "00";
            } else {
              // Handle case where there's just a number without minutes
              hourNum = parseInt(startTimePart);
              minute = "00";
            }

            // Ensure hour is a valid number
            if (isNaN(hourNum)) {
              hourNum = 8; // Default to 8am if parsing fails
              console.warn(
                `Invalid hour format: ${startTimePart}, defaulting to 8`
              );
            }

            // Ensure hour is between 0-23
            hourNum = Math.max(0, Math.min(23, hourNum));

            const endHour = (hourNum + 1) % 24;

            formattedTimeSlotId = `${hourNum
              .toString()
              .padStart(2, "0")}:${minute}-${endHour
              .toString()
              .padStart(2, "0")}:${minute}`;
          }
        } else if (
          parts[0].includes("AM") ||
          parts[0].includes("PM") ||
          parts[1].includes("AM") ||
          parts[1].includes("PM")
        ) {
          // Handle timeSlot with both start and end times in 12-hour format
          let startHour = 8;
          let startMinute = "00";
          let endHour = 9;
          let endMinute = "00";

          // Process start time
          const startPart = parts[0].trim();
          if (startPart.includes("AM") || startPart.includes("PM")) {
            const timeParts = startPart.split(" ");
            const time = timeParts[0];
            const ampm = timeParts[1];

            if (time.includes(":")) {
              const [hour, min] = time.split(":");
              startHour = parseInt(hour);
              startMinute = min || "00";

              if (ampm === "PM" && startHour < 12) startHour += 12;
              else if (ampm === "AM" && startHour === 12) startHour = 0;
            }
          }

          // Process end time
          const endPart = parts[1].trim();
          if (endPart.includes("AM") || endPart.includes("PM")) {
            const timeParts = endPart.split(" ");
            const time = timeParts[0];
            const ampm = timeParts[1];

            if (time.includes(":")) {
              const [hour, min] = time.split(":");
              endHour = parseInt(hour);
              endMinute = min || "00";

              if (ampm === "PM" && endHour < 12) endHour += 12;
              else if (ampm === "AM" && endHour === 12) endHour = 0;
            }
          }

          // Ensure hours are valid
          startHour = Math.max(0, Math.min(23, startHour));
          endHour = Math.max(0, Math.min(23, endHour));

          // Format in 24-hour time
          formattedTimeSlotId = `${startHour
            .toString()
            .padStart(2, "0")}:${startMinute}-${endHour
            .toString()
            .padStart(2, "0")}:${endMinute}`;
        }
      } else if (!timeSlotId.includes("-")) {
        // If no hyphen, assume it's just a start time and add an hour for end time
        let startTime = timeSlotId.trim();
        let startHour = 8;
        let startMinute = "00";

        if (startTime.includes("AM") || startTime.includes("PM")) {
          // Handle 12-hour format without end time
          const timeParts = startTime.split(" ");
          const time = timeParts[0];
          const ampm = timeParts[1] || "AM";

          if (time.includes(":")) {
            const [hour, min] = time.split(":");
            startHour = parseInt(hour);
            startMinute = min || "00";
          } else {
            startHour = parseInt(time);
          }

          if (ampm === "PM" && startHour < 12) startHour += 12;
          else if (ampm === "AM" && startHour === 12) startHour = 0;
        } else {
          // Handle 24-hour format without end time
          if (startTime.includes(":")) {
            const [hour, min] = startTime.split(":");
            startHour = parseInt(hour);
            startMinute = min || "00";
          } else {
            // Single number provided
            startHour = parseInt(startTime);
          }
        }

        // Ensure hour is valid
        if (isNaN(startHour)) {
          startHour = 8; // Default to 8am if parsing fails
        }

        startHour = Math.max(0, Math.min(23, startHour));
        const endHour = (startHour + 1) % 24;

        formattedTimeSlotId = `${startHour
          .toString()
          .padStart(2, "0")}:${startMinute}-${endHour
          .toString()
          .padStart(2, "0")}:${startMinute}`;
      }
    } catch (error) {
      console.warn("Error formatting time slot, using default", error);
      // Provide a safe default if time parsing fails
      formattedTimeSlotId = "08:00-09:00";
    }

    console.log(
      `Formatting timeSlotId from ${timeSlotId} to ${formattedTimeSlotId}`
    );

    const response = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        name,
        courtId,
        date: formattedDate,
        timeSlotId: formattedTimeSlotId,
        numberOfPlayers,
        notes,
        paymentStatus,
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
    return result.data?.bookings || [];
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
