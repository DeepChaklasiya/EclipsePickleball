import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import BookingSteps from "@/components/BookingSteps";
import { useBooking } from "@/context/BookingContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Time slot types
interface TimeSlot {
  id: string;
  time: string;
  section: "morning" | "afternoon" | "evening";
}

const DateTimeSelect = () => {
  const navigate = useNavigate();
  const { setBookingDate, setBookingTimeSlot } = useBooking();

  // Generate dates for the next 10 days
  const today = new Date();
  const dates = Array.from({ length: 10 }, (_, i) => addDays(today, i));

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(dates[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<
    TimeSlot | undefined
  >();
  const [buttonHighlighted, setButtonHighlighted] = useState(false);
  const selectionComplete = selectedDate && selectedTimeSlot;

  // Time slots organized by section
  const timeSlots: TimeSlot[] = [
    // Morning slots
    { id: "m1", time: "6:00 AM", section: "morning" },
    { id: "m2", time: "7:00 AM", section: "morning" },
    { id: "m3", time: "8:00 AM", section: "morning" },
    { id: "m4", time: "9:00 AM", section: "morning" },
    { id: "m5", time: "10:00 AM", section: "morning" },
    { id: "m6", time: "11:00 AM", section: "morning" },

    // Afternoon slots
    { id: "a1", time: "12:00 PM", section: "afternoon" },
    { id: "a2", time: "1:00 PM", section: "afternoon" },
    { id: "a3", time: "2:00 PM", section: "afternoon" },
    { id: "a4", time: "3:00 PM", section: "afternoon" },
    { id: "a5", time: "4:00 PM", section: "afternoon" },
    { id: "a6", time: "5:00 PM", section: "afternoon" },

    // Evening slots
    { id: "e1", time: "6:00 PM", section: "evening" },
    { id: "e2", time: "7:00 PM", section: "evening" },
    { id: "e3", time: "8:00 PM", section: "evening" },
    { id: "e4", time: "9:00 PM", section: "evening" },
    { id: "e5", time: "10:00 PM", section: "evening" },
    { id: "e6", time: "11:00 PM", section: "evening" },

    // Special Eclipse slot (independent of time)
    { id: "eclipse", time: "Midnight", section: "evening" },
  ];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(undefined);
    checkSelectionStatus();
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);

    // If date is already selected, trigger the highlight animation
    if (selectedDate) {
      setButtonHighlighted(true);
      setTimeout(() => setButtonHighlighted(false), 1000);
    }
  };

  // Check if both date and time are selected to potentially trigger animation
  const checkSelectionStatus = () => {
    if (selectedDate && selectedTimeSlot) {
      setButtonHighlighted(true);
      setTimeout(() => setButtonHighlighted(false), 1000);
    }
  };

  const handleContinue = () => {
    if (!selectedDate) {
      toast({
        title: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTimeSlot) {
      toast({
        title: "Please select a time slot",
        variant: "destructive",
      });
      return;
    }

    // Format the time slot for the booking context
    const formattedTimeSlot = {
      id: selectedTimeSlot.id,
      startTime: selectedTimeSlot.time,
      endTime: calculateEndTime(selectedTimeSlot.time),
      section: selectedTimeSlot.section,
      // Add a special flag for the Eclipse slot
      isSpecialEclipseSlot: selectedTimeSlot.id === "eclipse",
    };

    setBookingDate(selectedDate);
    setBookingTimeSlot(formattedTimeSlot);
    navigate("/court-select");
  };

  // Calculate end time (1 hour after start time)
  const calculateEndTime = (startTime: string): string => {
    // For the special Eclipse slot, return empty string
    if (startTime === "Midnight") {
      return "";
    }

    // Parse the start time
    const [timeStr, period] = startTime.split(" ");
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr);

    // Adjust hour based on AM/PM
    if (period === "PM" && hour < 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    // Add 1 hour
    hour = (hour + 1) % 24;

    // Format back to string with AM/PM
    const nextPeriod = hour >= 12 ? "PM" : "AM";
    const nextHour = hour % 12 || 12; // Convert 0 to 12 for display

    return `${nextHour}:${minuteStr || "00"} ${nextPeriod}`;
  };

  // Get time slots filtered by section
  const getMorningSlotsFiltered = () =>
    timeSlots.filter((slot) => slot.section === "morning");
  const getAfternoonSlotsFiltered = () =>
    timeSlots.filter((slot) => slot.section === "afternoon");
  const getEveningSlotsFiltered = () =>
    timeSlots.filter((slot) => slot.section === "evening");

  return (
    <div className="page-container bg-black text-white min-h-screen flex flex-col">
      {/* Fixed header section */}
      <div className="fixed top-14 left-0 right-0 z-10 bg-black pt-6 pb-2">
        <div className="container mx-auto pl-2 pr-2">
          <Header showBackButton title="DATE & TIME" />
          <BookingSteps />

          {/* Fixed Date Selection */}
          <div className="mb-6 overflow-x-auto py-2">
            <div className="flex space-x-2 min-w-max pb-2">
              {dates.map((date, index) => {
                const isSelected =
                  selectedDate &&
                  format(selectedDate, "yyyy-MM-dd") ===
                    format(date, "yyyy-MM-dd");

                return (
                  <div
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    className={`cursor-pointer rounded-lg p-3 min-w-[4.5rem] text-center transition-all duration-300 transform hover:scale-105 ${
                      isSelected
                        ? "bg-gradient-to-br from-[#3A2922] to-[#2A1912] shadow-[0_0_30px_rgba(255,165,0,0.7)] border border-pink-300/40 animate-bounce-subtle"
                        : "bg-white hover:shadow-[0_0_20px_rgba(0,200,255,0.5)] hover:border hover:border-blue-300/30"
                    }`}
                  >
                    <div
                      className={`text-[10px] uppercase font-light tracking-wider ${
                        isSelected ? "text-white" : "text-black"
                      }`}
                    >
                      {format(date, "EEE")}
                    </div>
                    <div
                      className={`text-2xl font-light ${
                        isSelected ? "text-white" : "text-black"
                      }`}
                    >
                      {format(date, "dd")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-grow overflow-y-auto pb-20 mt-[230px]">
        {/* Time Slots */}
        <div className="space-y-8 container mx-auto pl-2 pr-2">
          {/* Morning */}
          <div className="bg-green-100 rounded-lg p-5 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,128,0.1)] hover:shadow-[0_0_20px_rgba(0,255,128,0.2)]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="mr-2">☀️</span>
                <span className="font-light text-black tracking-wider text-lg">
                  MORNING
                </span>
              </div>
              <div className="font-light text-black tracking-wider">₹600</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {getMorningSlotsFiltered().map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleTimeSlotSelect(slot)}
                  className={`py-3 px-3 rounded-md border transition-all duration-300 transform 
                    ${
                      selectedTimeSlot?.id === slot.id
                        ? "bg-gradient-to-r from-pink-400 to-amber-300 text-black font-light border-transparent shadow-[0_0_15px_rgba(255,165,0,0.5)] scale-105"
                        : "bg-white text-black border-green-300 font-light hover:border-blue-400 hover:shadow-[0_0_10px_rgba(0,200,255,0.3)] hover:scale-105"
                    }`}
                >
                  <span
                    className={`transition-all duration-300 ${
                      selectedTimeSlot?.id === slot.id ? "text-black" : ""
                    }`}
                  >
                    {slot.time}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Afternoon */}
          <div className="bg-yellow-100 rounded-lg p-5 transition-all duration-300 shadow-[0_0_15px_rgba(255,165,0,0.1)] hover:shadow-[0_0_20px_rgba(255,165,0,0.2)]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="mr-2">🌞</span>
                <span className="font-light text-black tracking-wider text-lg">
                  AFTERNOON
                </span>
              </div>
              <div className="font-light text-black tracking-wider">₹600</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {getAfternoonSlotsFiltered().map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleTimeSlotSelect(slot)}
                  className={`py-3 px-3 rounded-md border transition-all duration-300 transform 
                    ${
                      selectedTimeSlot?.id === slot.id
                        ? "bg-gradient-to-r from-pink-400 to-amber-300 text-black font-light border-transparent shadow-[0_0_15px_rgba(255,165,0,0.5)] scale-105"
                        : "bg-white text-black border-yellow-300 font-light hover:border-blue-400 hover:shadow-[0_0_10px_rgba(0,200,255,0.3)] hover:scale-105"
                    }`}
                >
                  <span
                    className={`transition-all duration-300 ${
                      selectedTimeSlot?.id === slot.id ? "text-black" : ""
                    }`}
                  >
                    {slot.time}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Evening */}
          <div className="bg-red-100 rounded-lg p-5 transition-all duration-300 shadow-[0_0_15px_rgba(255,0,128,0.1)] hover:shadow-[0_0_20px_rgba(255,0,128,0.2)]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="mr-2">🌙</span>
                <span className="font-light text-black tracking-wider text-lg">
                  EVENING
                </span>
              </div>
              <div className="font-light text-black tracking-wider">₹900</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {getEveningSlotsFiltered()
                .filter((slot) => slot.id !== "eclipse")
                .map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleTimeSlotSelect(slot)}
                    className={`py-3 px-3 rounded-md border transition-all duration-300 transform 
                    ${
                      selectedTimeSlot?.id === slot.id
                        ? "bg-gradient-to-r from-pink-400 to-amber-300 text-black font-light border-transparent shadow-[0_0_15px_rgba(255,165,0,0.5)] scale-105"
                        : "bg-white text-black border-red-300 font-light hover:border-blue-400 hover:shadow-[0_0_10px_rgba(0,200,255,0.3)] hover:scale-105"
                    }`}
                  >
                    <span
                      className={`transition-all duration-300 ${
                        selectedTimeSlot?.id === slot.id ? "text-black" : ""
                      }`}
                    >
                      {slot.time}
                    </span>
                  </button>
                ))}
            </div>

            {/* Special Eclipse Slot */}
            <div className="mt-4 border-t border-red-200 pt-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <span className="mr-2">✨</span>
                  <span className="font-medium text-black tracking-wider text-sm">
                    EXCLUSIVE BOOKING
                  </span>
                </div>
              </div>

              {getEveningSlotsFiltered()
                .filter((slot) => slot.id === "eclipse")
                .map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleTimeSlotSelect(slot)}
                    className={`w-full py-4 px-3 rounded-md border transition-all duration-300 transform 
                    ${
                      selectedTimeSlot?.id === slot.id
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium border-transparent shadow-[0_0_15px_rgba(147,51,234,0.7)] scale-105"
                        : "bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-black border-purple-300 font-medium hover:from-purple-500/20 hover:to-pink-500/20 hover:shadow-[0_0_10px_rgba(147,51,234,0.3)] hover:scale-105"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-lg font-bold mb-1">
                        {slot.time}
                      </span>
                      <span className="text-xs opacity-80">12 AM - 1 AM</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visual separator */}
      <div className="h-4 bg-black"></div>

      <div className="sticky-button-container">
        <Button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTimeSlot}
          variant="cosmic"
          size="cosmic"
          className={cn(
            "w-full relative group",
            !selectionComplete && "opacity-75 cursor-not-allowed",
            selectionComplete && buttonHighlighted && "animate-pulse shadow-lg"
          )}
        >
          <span className="flex items-center justify-center">
            CONTINUE
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={cn(
                "h-5 w-5 ml-2 transition-transform group-hover:translate-x-1",
                selectionComplete && buttonHighlighted && "animate-bounce"
              )}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </Button>
      </div>
    </div>
  );
};

export default DateTimeSelect;
