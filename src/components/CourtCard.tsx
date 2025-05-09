
import { Card, CardContent } from "@/components/ui/card";
import { Court } from "@/context/BookingContext";

interface CourtCardProps {
  court: Court;
  isSelected: boolean;
  isAvailable?: boolean;
  onClick: () => void;
}

const CourtCard = ({ 
  court, 
  isSelected, 
  isAvailable = true, 
  onClick 
}: CourtCardProps) => {
  return (
    <Card
      onClick={isAvailable ? onClick : undefined}
      className={`cursor-pointer transition-all duration-300 overflow-hidden h-48 ${
        !isAvailable 
          ? "opacity-60 cursor-not-allowed" 
          : "hover:scale-[1.02]"
      } ${
        isSelected && isAvailable
          ? "border-2 border-eclipse-pink shadow-lg shadow-eclipse-pink/20" 
          : "glass-card"
      }`}
    >
      <div className="relative h-full w-full">
        <img
          src={court.image}
          alt={court.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-eclipse-dark to-transparent" />
        <CardContent className="absolute bottom-0 left-0 p-4">
          <h3 className="text-xl font-bold text-white">{court.name}</h3>
          <p className="text-xs text-muted-foreground">
            {isAvailable ? "Available" : "Booked"}
          </p>
        </CardContent>
      </div>
    </Card>
  );
};

export default CourtCard;
