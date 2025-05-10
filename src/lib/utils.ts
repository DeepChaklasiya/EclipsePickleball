import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a time string to display in IST with AM/PM
 * @param timeString Time string in 24-hour format (e.g., "14:00") or with AM/PM already
 * @returns Formatted time string with AM/PM in IST
 */
export function formatTimeToIST(timeString: string): string {
  if (!timeString) return "";

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
}

/**
 * Formats a time range to display in IST with AM/PM
 * @param startTime Start time string
 * @param endTime End time string (optional, will be calculated as start time + 1 hour if not provided)
 * @returns Formatted time range with AM/PM in IST
 */
export function formatTimeRangeIST(
  startTime: string,
  endTime?: string
): string {
  if (!startTime) return "Time not specified";

  const formattedStartTime = formatTimeToIST(startTime);

  // If endTime is provided, use it; otherwise calculate it as startTime + 1 hour
  let formattedEndTime;
  if (endTime) {
    formattedEndTime = formatTimeToIST(endTime);
  } else {
    // Extract hours and minutes from startTime
    let [hours, minutes] = startTime.split(":");
    let period = "AM";

    if (startTime.includes("AM") || startTime.includes("PM")) {
      // Handle if startTime already includes AM/PM
      const timeParts = startTime.split(" ");
      [hours, minutes] = timeParts[0].split(":");
      period = timeParts[1] || "AM";
    }

    // Convert to number and add 1 hour
    let hoursNum = parseInt(hours);

    if (period === "PM" && hoursNum < 12) {
      hoursNum += 12; // Convert to 24h format
    } else if (period === "AM" && hoursNum === 12) {
      hoursNum = 0; // 12 AM is 0 in 24h format
    }

    hoursNum = (hoursNum + 1) % 24; // Add 1 hour and handle midnight rollover

    // Convert back to 12h format with AM/PM
    const newPeriod = hoursNum >= 12 ? "PM" : "AM";
    const hours12 = hoursNum % 12 || 12; // Convert 0 to 12 for 12 AM

    formattedEndTime = `${hours12}:${minutes} ${newPeriod}`;
  }

  return `${formattedStartTime} - ${formattedEndTime} IST`;
}
