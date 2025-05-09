
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Location } from "@/context/BookingContext";

interface LocationCardProps {
  location: Location;
  isSelected: boolean;
  onClick: () => void;
}

const LocationCard = ({ location, isSelected, onClick }: LocationCardProps) => {
  return (
    <Card 
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 overflow-hidden hover:scale-[1.02] ${
        isSelected 
          ? "border-2 border-eclipse-pink shadow-lg shadow-eclipse-pink/20" 
          : "glass-card"
      }`}
    >
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-eclipse-dark to-transparent" />
      </div>
      <CardContent className="p-4">
        <CardTitle className="text-lg md:text-xl mb-1">{location.name}</CardTitle>
        <CardDescription className="text-muted-foreground">{location.address}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default LocationCard;
