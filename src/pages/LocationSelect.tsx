import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BookingSteps from "@/components/BookingSteps";
import LocationCard from "@/components/LocationCard";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/context/BookingContext";
import { toast } from "@/hooks/use-toast";

const LocationSelect = () => {
  const navigate = useNavigate();
  const { locations, booking, setBookingLocation } = useBooking();
  const [selectedLocation, setSelectedLocation] = useState(booking.location?.id || "");

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
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
          className="w-full"
        >
          <span>CONTINUE</span>
        </Button>
      </div>
    </div>
  );
};

export default LocationSelect;
