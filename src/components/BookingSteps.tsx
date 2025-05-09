
import { Check } from "lucide-react";
import { useLocation } from "react-router-dom";

const steps = [
  { path: "/location-select", name: "Location" },
  { path: "/date-time-select", name: "Date & Time" },
  { path: "/court-select", name: "Court" },
  { path: "/booking-details", name: "Details" },
  { path: "/booking-confirmation", name: "Confirmation" },
];

const BookingSteps = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const currentStepIndex = steps.findIndex((step) => step.path === currentPath);
  
  return (
    <div className="w-full mb-8 overflow-x-auto">
      <div className="flex justify-between min-w-max px-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <div key={step.path} className="flex flex-col items-center">
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-medium 
                  ${isCompleted ? "bg-eclipse-gradient" : isCurrent ? "border-2 border-eclipse-pink bg-black" : "bg-secondary/30"}`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-black" />
                  ) : (
                    <span className={isCurrent ? "text-eclipse-pink" : "text-foreground"}>{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`w-16 h-0.5 sm:w-24 ${
                      index < currentStepIndex ? "bg-eclipse-gradient" : "bg-secondary/30"
                    }`}
                  />
                )}
              </div>
              <span 
                className={`text-xs mt-2 ${
                  isCurrent ? "text-eclipse-pink font-medium" : "text-muted-foreground"
                }`}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingSteps;
