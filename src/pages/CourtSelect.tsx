import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import BookingSteps from "@/components/BookingSteps";
import { useBooking } from "@/context/BookingContext";
import { toast } from "sonner";
import { getBookedCourts } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Define keyframe animations
const courtAnimations = `
  @keyframes courtAnimation1 {
    0% { background-color: rgb(96, 165, 250); }
    50% { background-color: rgb(209, 213, 219); }
    100% { background-color: rgb(156, 163, 175); }
  }
  @keyframes courtAnimation2 {
    0% { background-color: rgb(96, 165, 250); }
    50% { background-color: rgb(253, 230, 138); }
    100% { background-color: rgb(253, 224, 71); }
  }
  @keyframes courtAnimation3 {
    0% { background-color: rgb(96, 165, 250); }
    50% { background-color: rgb(147, 197, 253); }
    100% { background-color: rgb(59, 130, 246); }
  }
  @keyframes courtAnimation4 {
    0% { background-color: rgb(96, 165, 250); }
    50% { background-color: rgb(252, 165, 165); }
    100% { background-color: rgb(239, 68, 68); }
  }
  @keyframes courtAnimation5 {
    0% { background-color: rgb(96, 165, 250); }
    50% { background-color: rgb(251, 207, 137); }
    100% { background-color: rgb(251, 146, 60); }
  }
  @keyframes courtAnimation6 {
    0% { background-color: rgb(96, 165, 250); }
    50% { background-color: rgb(217, 171, 100); }
    100% { background-color: rgb(217, 154, 43); }
  }
  @keyframes courtAnimation7 {
    0% { background-color: rgb(96, 165, 250); }
    50% { background-color: rgb(103, 232, 249); }
    100% { background-color: rgb(6, 182, 212); }
  }

  .animate-court-1 {
    animation: courtAnimation1 2s ease-in-out forwards;
  }
  .animate-court-2 {
    animation: courtAnimation2 2s ease-in-out forwards;
  }
  .animate-court-3 {
    animation: courtAnimation3 2s ease-in-out forwards;
  }
  .animate-court-4 {
    animation: courtAnimation4 2s ease-in-out forwards;
  }
  .animate-court-5 {
    animation: courtAnimation5 2s ease-in-out forwards;
  }
  .animate-court-6 {
    animation: courtAnimation6 2s ease-in-out forwards;
  }
  .animate-court-7 {
    animation: courtAnimation7 2s ease-in-out forwards;
  }

  @keyframes planetSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes planetBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  .planet-spin {
    animation: planetSpin 2s linear infinite;
  }
  
  .planet-bounce {
    animation: planetBounce 1.5s ease-in-out infinite;
  }
  
  .buffer-fade-in {
    animation: fadeIn 0.3s ease-in-out forwards;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .buffer-fade-out {
    animation: fadeOut 0.3s ease-in-out forwards;
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  
  .coming-soon-pulse {
    animation: pulse 2s ease-in-out infinite;
  }
`;

const CourtSelect = () => {
  const navigate = useNavigate();
  const { booking, setBookingCourt } = useBooking();
  const [animate, setAnimate] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showBuffer, setShowBuffer] = useState(false);
  const [bufferComplete, setBufferComplete] = useState(true);
  const [buttonHighlighted, setButtonHighlighted] = useState(false);

  const [selectedCourtId, setSelectedCourtId] = useState<string | undefined>(
    booking.court?.id
  );
  const [bookedCourts, setBookedCourts] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null
  );

  // Check if the location is Andromeda (coming soon)
  const isLocationComingSoon = booking.location?.id === "2";

  // Fetch booked courts for the selected date and time
  useEffect(() => {
    const fetchBookedCourts = async () => {
      if (!booking.date || !booking.timeSlot) {
        navigate("/date-time-select");
        return;
      }

      try {
        setLoadingAvailability(true);

        // Determine the appropriate timeSlotId to use
        let timeSlotId;

        // First option: Use the actual time slot ID if available
        if (booking.timeSlot.id) {
          timeSlotId = booking.timeSlot.id;
        }
        // Second option: Use section-based format (m5, a2, e3) if we have section information
        else if (booking.timeSlot.section) {
          // Extract the first letter of the section (morning -> m, afternoon -> a, evening -> e)
          const sectionPrefix = booking.timeSlot.section
            .charAt(0)
            .toLowerCase();

          // Try to determine the slot number based on the start time
          let slotNumber = 1;
          if (
            booking.timeSlot.startTime &&
            booking.timeSlot.startTime.includes(":")
          ) {
            const hour = parseInt(booking.timeSlot.startTime.split(":")[0]);

            // Calculate slot number based on time section
            if (sectionPrefix === "m") {
              // morning (6-11)
              slotNumber = hour - 5; // 6am is slot 1, 7am is slot 2, etc.
            } else if (sectionPrefix === "a") {
              // afternoon (12-15)
              slotNumber = hour - 11; // 12pm is slot 1, 1pm is slot 2, etc.
            } else if (sectionPrefix === "e") {
              // evening (16-21)
              slotNumber = hour - 17; // 6pm is slot 1, 7pm is slot 2, etc.
            }
          }

          // Format as section + slot number (e.g., m5, a2, e3)
          timeSlotId = `${sectionPrefix}${slotNumber}`;
          console.log(`Using section-based format: ${timeSlotId}`);
        }
        // Third option: Use time range format
        else {
          // Format the times with leading zeros
          const formatTime = (time: string) => {
            // Handle cases where time might be in different formats
            if (!time) return "00:00";

            // If time already has a colon, ensure it has leading zeros
            if (time.includes(":")) {
              const [hours, minutes] = time.split(":");
              return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
            }

            // If time is just a number (e.g. "8"), add ":00" and leading zeros
            return `${time.padStart(2, "0")}:00`;
          };

          const startTime = formatTime(booking.timeSlot.startTime);
          const endTime = formatTime(booking.timeSlot.endTime || "");
          timeSlotId = `${startTime}-${endTime}`;
        }

        console.log("Booking time slot info:", {
          id: booking.timeSlot.id,
          startTime: booking.timeSlot.startTime,
          endTime: booking.timeSlot.endTime,
          section: booking.timeSlot.section,
          formattedTimeSlotId: timeSlotId,
        });

        // Fetch booked courts
        const bookedCourtsList = await getBookedCourts(
          booking.date.toISOString(),
          timeSlotId
        );
        setBookedCourts(bookedCourtsList);
        setAvailabilityError(null);
      } catch (error) {
        console.error("Error fetching booked courts:", error);
        setAvailabilityError(
          "Failed to load court availability. Some courts may not be available."
        );
        toast.error("Failed to check court availability");
      } finally {
        setLoadingAvailability(false);
      }
    };

    if (!isLocationComingSoon) {
      fetchBookedCourts();
    }
  }, [booking.date, booking.timeSlot, navigate, isLocationComingSoon]);

  // Add animation styles when component mounts
  useEffect(() => {
    // Create style element
    const styleElement = document.createElement("style");
    styleElement.innerHTML = courtAnimations;
    document.head.appendChild(styleElement);

    // Cleanup function
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const startAnimation = () => {
    setAnimate(true);
    // Mark animation as complete after it finishes
    setTimeout(() => {
      setAnimationComplete(true);
    }, 2100); // Animation duration + slight buffer
  };

  // Create array of courts with planet names
  const courts = [
    {
      id: "1",
      name: "Venus",
      image: "",
      color: "bg-yellow-300",
      description: "VENUS - Hot and bright",
      icon: (
        <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-yellow-200 border border-yellow-400 shadow-lg">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-100 to-yellow-500"></div>
        </div>
      ),
    },
    {
      id: "2",
      name: "Mercury",
      image: "",
      color: "bg-gray-400",
      description: "MERCURY - Small and fast",
      icon: (
        <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gray-300 border border-gray-400 shadow-lg">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-500"></div>
        </div>
      ),
    },
    {
      id: "3",
      name: "Earth",
      image: "",
      color: "bg-blue-500",
      description: "EARTH - Home sweet home",
      icon: (
        <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-blue-300 border border-blue-600 shadow-lg">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-200 to-green-500"></div>
        </div>
      ),
    },
    {
      id: "4",
      name: "Mars",
      image: "",
      color: "bg-red-500",
      description: "MARS - The red planet",
      icon: (
        <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-red-400 border border-red-600 shadow-lg">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-red-300 to-red-600"></div>
        </div>
      ),
    },
    {
      id: "5",
      name: "Jupiter",
      image: "",
      color: "bg-orange-400",
      description: "JUPITER - The gas giant",
      icon: (
        <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-orange-300 border border-orange-500 shadow-lg">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-200 to-orange-600 flex items-center justify-center">
            <div className="w-6 h-1 bg-orange-700 rounded-full"></div>
          </div>
        </div>
      ),
    },
    {
      id: "6",
      name: "Saturn",
      image: "",
      color: "bg-yellow-600",
      description: "SATURN - The ringed planet",
      icon: (
        <div className="absolute -top-4 -left-4 w-10 h-8">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-600 relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-2 bg-yellow-300 rounded-full rotate-12 border border-yellow-500"></div>
          </div>
        </div>
      ),
    },
    {
      id: "7",
      name: "Neptune",
      image: "",
      color: "bg-blue-700",
      description: "NEPTUNE - The ice giant",
      icon: (
        <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-blue-600 border border-blue-800 shadow-lg">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-800"></div>
        </div>
      ),
    },
  ];

  // Check if a court is booked
  const isCourtBooked = (courtId: string): boolean => {
    // Convert courtId to use the ID system in the backend
    // In the frontend we use CourtId 1-7, but the backend might store them differently
    const backendCourtId = String(8 - Number(courtId));
    return bookedCourts.includes(backendCourtId);
  };

  const handleCourtSelect = (courtId: string) => {
    if (isLocationComingSoon || isCourtBooked(courtId)) return;

    if (courtId === selectedCourtId) {
      // If same court is clicked again, deselect it
      setSelectedCourtId(undefined);
    } else {
      setSelectedCourtId(courtId);
      
      // Briefly flash the continue button when court is selected
      setButtonHighlighted(true);
      setTimeout(() => setButtonHighlighted(false), 1000);
    }
  };

  const handleContinue = () => {
    if (!selectedCourtId) {
      toast.error("Please select a court");
      return;
    }

    // Start animation and buffer effect
    startAnimation();
    setShowBuffer(true);
    setBufferComplete(false);

    // Simulate loading buffer for 1.5 seconds
    setTimeout(() => {
      // Delay hiding the buffer to show the completion
      setTimeout(() => {
        setBufferComplete(true);
        setTimeout(() => {
          setShowBuffer(false);

          // Navigate after animation completes
          const court = courts.find((c) => c.id === selectedCourtId);
          if (court) {
            setBookingCourt(court);
            navigate("/booking-details");
          }
        }, 300); // Fade out animation time
      }, 500);
    }, 1500);
  };

  // Show booking summary
  const formatBookingSummary = () => {
    if (!booking.location || !booking.date || !booking.timeSlot) {
      return "Please complete previous steps";
    }

    return `${booking.location.name} • ${format(booking.date, "MMM d")} • ${
      booking.timeSlot.startTime
    }`;
  };

  // Define the animation class
  const getAnimationClass = (index: number) => {
    if (!animate) return "";
    return `animate-court-${index + 1}`;
  };

  // Get planet data for loading buffer
  const getBufferPlanet = () => {
    if (!selectedCourtId) {
      // Default to Earth if nothing selected
      return {
        color: "bg-blue-500",
        gradientFrom: "from-blue-200",
        gradientTo: "to-green-500",
        name: "Earth",
      };
    }

    const court = courts.find((c) => c.id === selectedCourtId);
    if (!court)
      return {
        color: "bg-blue-500",
        gradientFrom: "from-blue-200",
        gradientTo: "to-green-500",
        name: "Earth",
      };

    // Map planet colors to gradients
    const planetColors: Record<string, { from: string; to: string }> = {
      "bg-gray-400": { from: "from-gray-200", to: "to-gray-500" },
      "bg-yellow-300": { from: "from-yellow-100", to: "to-yellow-500" },
      "bg-blue-500": { from: "from-blue-200", to: "to-green-500" },
      "bg-red-500": { from: "from-red-300", to: "to-red-600" },
      "bg-orange-400": { from: "from-orange-200", to: "to-orange-600" },
      "bg-yellow-600": { from: "from-yellow-200", to: "to-yellow-600" },
      "bg-blue-700": { from: "from-blue-400", to: "to-blue-800" },
    };

    return {
      color: court.color,
      gradientFrom: planetColors[court.color]?.from || "from-blue-200",
      gradientTo: planetColors[court.color]?.to || "to-blue-500",
      name: court.name,
    };
  };

  const bufferPlanet = getBufferPlanet();

  return (
    <div className="page-container">
      <div className="content-with-sticky-button">
        <Header showBackButton title="Court Selection" />
        <BookingSteps />

        <div className="mb-8">
          <div className="text-sm font-medium bg-gradient-to-r from-pink-300 to-amber-200 bg-clip-text text-transparent mb-2">
            Current Selection
          </div>
          <div className="p-3 bg-secondary/40 rounded-lg border border-secondary text-white">
            {formatBookingSummary()}
          </div>
        </div>

        {isLocationComingSoon ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-300 to-blue-500 shadow-lg flex items-center justify-center overflow-hidden planet-spin">
                <div className="absolute w-full h-full bg-black opacity-70"></div>
                <div className="absolute w-40 h-6 bg-purple-400/40 rounded-full rotate-45 transform -translate-y-4"></div>
                <div className="absolute w-40 h-4 bg-blue-400/30 rounded-full rotate-[30deg] transform translate-y-6"></div>
                <div className="z-10 text-white font-bold text-3xl">?</div>
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 flex items-center justify-center bg-red-500 rounded-full text-white text-xs font-bold border-2 border-white z-10 coming-soon-pulse">
                NEW
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-3">
              Coming Soon!
            </h2>
            <p className="text-center text-muted-foreground max-w-md">
              Eclipse Andromeda is under construction. Our newest cosmic courts
              will be opening soon!
            </p>
            <div className="mt-8 flex flex-col items-center">
              <p className="text-sm text-muted-foreground mb-2">
                Please check back later
              </p>
              <Button
                onClick={() => navigate(-1)}
                variant="cosmic"
                size="sm"
                className="mt-2"
              >
                <span>GO BACK</span>
              </Button>
            </div>
          </div>
        ) : loadingAvailability ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-pink-400 animate-spin mb-4" />
            <p className="text-center text-muted-foreground">
              Checking court availability...
            </p>
          </div>
        ) : (
          <>
            {availabilityError && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-6 text-red-200 text-sm">
                {availabilityError}
              </div>
            )}

            <div className="relative mb-8 overflow-hidden rounded-lg shadow-lg mx-auto max-w-xl">
              {/* Court container */}
              <div className="bg-gray-800 p-4 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center w-full">
                  {/* Entry point */}
                  <div className="mb-3 self-center">
                    <div className="bg-gradient-to-r from-pink-400 to-amber-300 px-4 py-0.5 rounded-t-lg text-black text-xs font-medium">
                      ENTRY
                    </div>
                  </div>

                  {/* Courts column */}
                  <div className="flex flex-col space-y-5 py-4 w-full items-center justify-center">
                    {courts.map((court, index) => {
                      const isBooked = isCourtBooked(court.id);
                      return (
                        <div
                          key={court.id}
                          className={`transition-all duration-300 flex justify-center items-center w-full ${
                            isBooked
                              ? "opacity-60 cursor-not-allowed"
                              : "hover:scale-[1.02] cursor-pointer"
                          }`}
                          onClick={() =>
                            !isBooked && handleCourtSelect(court.id)
                          }
                        >
                          <div
                            className={`flex flex-row items-center p-2 rounded-lg transition-all duration-300 w-full justify-center ${
                              selectedCourtId === court.id
                                ? "bg-gradient-to-r from-pink-500/20 to-amber-300/20 shadow-md shadow-pink-400/30"
                                : isBooked
                                ? "bg-gray-700/50"
                                : "hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-amber-300/10"
                            }`}
                          >
                            <div className="relative">
                              {court.icon}
                              <div className="relative">
                                <img
                                  src="/images/pickleball-court.svg"
                                  alt={`Pickleball Court ${court.name}`}
                                  className={`w-56 h-auto transition-all duration-300 rounded-lg ${
                                    selectedCourtId === court.id
                                      ? "ring-1 ring-offset-2 ring-offset-gray-800 ring-pink-400/50 shadow-lg shadow-pink-400/20"
                                      : isBooked
                                      ? "grayscale"
                                      : "hover:shadow-md hover:shadow-amber-300/20"
                                  }`}
                                />

                                {/* Court number overlay */}
                                <div
                                  className={`absolute top-1 left-1/2 transform -translate-x-1/2 ${
                                    isBooked
                                      ? "bg-gray-600/90 text-gray-300"
                                      : "bg-gradient-to-r from-pink-400/90 to-amber-300/90 text-black"
                                  } text-sm font-bold py-1 px-4 rounded-full border border-white whitespace-nowrap`}
                                >
                                  Court {index + 1}: {court.name}
                                  {isBooked && (
                                    <span className="ml-2">(Booked)</span>
                                  )}
                                </div>

                                {selectedCourtId === court.id && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-400 to-amber-300 rounded-full border border-white z-10 flex items-center justify-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3 text-black"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Exit point */}
                  <div className="mt-3 self-center">
                    <div className="bg-gradient-to-r from-pink-400 to-amber-300 px-4 py-0.5 rounded-b-lg text-black text-xs font-medium">
                      EXIT
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-center font-medium text-white mb-4">
              Selected Court:{" "}
              {selectedCourtId
                ? courts.find((c) => c.id === selectedCourtId)?.name
                : "None"}
            </h3>
          </>
        )}
      </div>

      {/* Court Selection Buffer */}
      {showBuffer && (
        <div
          className={`fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 ${
            bufferComplete ? "buffer-fade-out" : "buffer-fade-in"
          }`}
        >
          <div className="planet-bounce">
            <div className="w-20 h-20 relative">
              <div
                className={`w-full h-full rounded-full border shadow-lg border-white/20 planet-spin flex items-center justify-center overflow-hidden ${bufferPlanet.gradientFrom} ${bufferPlanet.gradientTo}`}
                style={{
                  background: `radial-gradient(circle, #ffffff 0%, rgba(0,0,0,0) 70%),
                             linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                }}
              >
                {/* Add a red dot for Mars */}
                {bufferPlanet.name === "Mars" && (
                  <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-red-700"></div>
                )}

                {/* Add rings for Saturn */}
                {bufferPlanet.name === "Saturn" && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-3 bg-yellow-300/60 rounded-full rotate-12"></div>
                )}

                {/* Stripes for Jupiter */}
                {bufferPlanet.name === "Jupiter" && (
                  <>
                    <div className="absolute top-1/3 w-full h-1.5 bg-orange-700/70"></div>
                    <div className="absolute top-2/3 w-full h-1.5 bg-orange-700/70"></div>
                  </>
                )}
                
                {/* Special features for Neptune */}
                {bufferPlanet.name === "Neptune" && (
                  <>
                    <div className="absolute w-full h-full opacity-70 bg-blue-900 mix-blend-overlay"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-1 bg-blue-300/60 rounded-full rotate-45"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-1 bg-blue-300/60 rounded-full -rotate-45"></div>
                  </>
                )}
              </div>

              {/* Small moon orbit for Earth */}
              {bufferPlanet.name === "Earth" && (
                <div
                  className="absolute -top-1 -right-1 planet-spin"
                  style={{ animationDuration: "4s" }}
                >
                  <div className="relative w-24 h-24 rounded-full border border-white/20 border-dashed">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 text-white text-center">
            <p className="text-xl font-bold">
              Preparing {bufferPlanet.name} Court
            </p>
            <p className="text-sm text-white/70 mt-1">
              Please wait a moment...
            </p>
          </div>
        </div>
      )}

      <div className="sticky-button-container">
        {!isLocationComingSoon && !loadingAvailability && (
          <Button
            onClick={handleContinue}
            disabled={!selectedCourtId || showBuffer}
            variant="cosmic"
            size="cosmic"
            className={cn(
              "w-full relative group",
              selectedCourtId && buttonHighlighted && "animate-pulse shadow-lg"
            )}
          >
            <span className="flex items-center justify-center">
              CONTINUE
              <svg xmlns="http://www.w3.org/2000/svg" className={cn(
                "h-5 w-5 ml-2 transition-transform group-hover:translate-x-1",
                selectedCourtId && buttonHighlighted && "animate-bounce"
              )} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default CourtSelect;
