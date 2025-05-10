import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BookingSteps from "@/components/BookingSteps";
import LocationCard from "@/components/LocationCard";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/context/BookingContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const LocationSelect = () => {
  const navigate = useNavigate();
  const { locations, booking, setBookingLocation, locationSelected } = useBooking();
  const [selectedLocation, setSelectedLocation] = useState(booking.location?.id || "");
  const [buttonHighlighted, setButtonHighlighted] = useState(false);

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
    
    // Briefly flash the continue button when location is selected
    setButtonHighlighted(true);
    setTimeout(() => setButtonHighlighted(false), 1000);
  };

  const handleContinue = () => {
    if (!selectedLocation) {
      toast({
        title: "Please select a location",
        variant: "destructive",
      });
      return;
    }

    const location = locations.find((loc) => loc.id === selectedLocation);
    if (location) {
      setBookingLocation(location);
      navigate("/date-time-select");
    }
  };

  return (
    <div className="page-container">
      <div className="content-with-sticky-button">
        <Header title="Book a Court" />
        <BookingSteps />

        <h2 className="section-title">Select Location</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              isSelected={selectedLocation === location.id}
              onClick={() => handleLocationSelect(location.id)}
            />
          ))}
        </div>
      </div>

      <div className="sticky-button-container">
        <Button 
          onClick={handleContinue} 
          variant="cosmic" 
          size="cosmic" 
          className={cn(
            "w-full font-semibold relative group",
            selectedLocation && buttonHighlighted && "animate-pulse shadow-lg"
          )}
        >
          <span className="flex items-center justify-center">
            CONTINUE
            <svg xmlns="http://www.w3.org/2000/svg" className={cn(
              "h-5 w-5 ml-2 transition-transform group-hover:translate-x-1",
              selectedLocation && buttonHighlighted && "animate-bounce"
            )} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        </Button>
      </div>
    </div>
  );
};

export default LocationSelect;
