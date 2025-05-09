
import { cn } from "@/lib/utils";
import { TimeSlot as TimeSlotType } from "@/context/BookingContext";

interface TimeSlotProps {
  timeSlot: TimeSlotType;
  isSelected: boolean;
  isAvailable?: boolean;
  onClick: () => void;
}

const TimeSlot = ({ 
  timeSlot, 
  isSelected, 
  isAvailable = true, 
  onClick 
}: TimeSlotProps) => {
  return (
    <button
      onClick={onClick}
      disabled={!isAvailable}
      className={cn(
        "flex flex-col items-center justify-center px-4 py-3 rounded-lg border transition-all",
        isAvailable 
          ? "cursor-pointer hover:bg-secondary/50" 
          : "opacity-50 cursor-not-allowed",
        isSelected 
          ? "border-eclipse-pink bg-eclipse-pink/10 shadow-sm shadow-eclipse-pink/20" 
          : "border-secondary bg-transparent"
      )}
    >
      <span className="text-base font-medium">
        {timeSlot.startTime} - {timeSlot.endTime}
      </span>
      <span className="text-xs text-muted-foreground mt-1">
        {isAvailable ? "Available" : "Booked"}
      </span>
    </button>
  );
};

export default TimeSlot;
