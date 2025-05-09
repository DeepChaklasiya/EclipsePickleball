import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import BookingSteps from "@/components/BookingSteps";
import { useBooking } from "@/context/BookingContext";
import { toast } from "@/hooks/use-toast";

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
  ];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(undefined);
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
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
      endTime: "", // In a real app, this would be calculated
    };

    setBookingDate(selectedDate);
    setBookingTimeSlot(formattedTimeSlot);
    navigate("/court-select");
  };

  // Get time slots filtered by section
  const getMorningSlotsFiltered = () =>
    timeSlots.filter((slot) => slot.section === "morning");
  const getAfternoonSlotsFiltered = () =>
    timeSlots.filter((slot) => slot.section === "afternoon");
  const getEveningSlotsFiltered = () =>
    timeSlots.filter((slot) => slot.section === "evening");

  return (
    <div className="page-container bg-black text-white min-h-screen">
      <div className="content-with-sticky-button">
        <Header showBackButton title="DATE & TIME" />
        <BookingSteps />

        {/* <div className="mb-8 mt-12">
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-light tracking-wider">
              WHEN WOULD <br />
              <span className="font-light">YOU LIKE TO PLAY?</span>
            </h2>
            <div className="text-xl font-light tracking-wider">
              <span className="bg-gradient-to-r from-pink-400 to-amber-300 bg-clip-text text-transparent">02</span>/03
            </div>
          </div>
        </div> */}

        {/* Date Selection */}
        <div className="mb-12 overflow-x-auto">
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
                      ? "bg-[#3A2922] shadow-[0_0_15px_rgba(255,165,0,0.5)]"
                      : "bg-white hover:shadow-[0_0_10px_rgba(0,200,255,0.3)]"
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

        {/* Time Slots */}
        <div className="space-y-8">
          {/* Morning */}
          <div className="bg-green-100 rounded-lg p-5 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,128,0.1)] hover:shadow-[0_0_20px_rgba(0,255,128,0.2)]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="mr-2">☀️</span>
                <span className="font-light text-black tracking-wider text-lg">
                  MORNING
                </span>
              </div>
              <div className="font-light text-black tracking-wider">₹500</div>
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
              <div className="font-light text-black tracking-wider">
                ₹800.00
              </div>
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
              <div className="font-light text-black tracking-wider">
                ₹800.00
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {getEveningSlotsFiltered().map((slot) => (
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
          </div>
        </div>
      </div>

      <div className="sticky-button-container">
        <Button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTimeSlot}
          variant="cosmic"
          size="cosmic"
          className="w-full"
        >
          <span>CONTINUE</span>
        </Button>
      </div>
    </div>
  );
};

export default DateTimeSelect;
