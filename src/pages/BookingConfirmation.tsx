import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Check,
  Map,
  ArrowRight,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useBooking } from "@/context/BookingContext";
import html2canvas from "html2canvas";
import { createBooking } from "@/lib/api";
import { formatTimeRangeIST, formatTimeToIST } from "@/lib/utils";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { booking, resetBooking } = useBooking();
  const [bookingCode, setBookingCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const bookingCardRef = useRef<HTMLDivElement>(null);

  // Generate random booking code
  useEffect(() => {
    const generateBookingCode = () => {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const codeLength = 8;
      let result = "";

      for (let i = 0; i < codeLength; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }

      return result;
    };

    setBookingCode(generateBookingCode());
  }, []);

  // Redirect to home if no booking details exist
  useEffect(() => {
    if (
      !booking.id ||
      !booking.location ||
      !booking.date ||
      !booking.timeSlot ||
      !booking.court ||
      !booking.details
    ) {
      navigate("/");
      return;
    }

    // Save booking to backend if not already saved
    const saveBookingToBackend = async () => {
      if (isSaved) {
        setIsLoading(false);
        return;
      }

      try {
        setIsSaving(true);
        setIsLoading(true);
        setError(null);
        const user = getUser();

        if (!user) {
          console.error("User not found");
          setError("User information not found. Please try logging in again.");
          setIsLoading(false);
          return;
        }

        // Determine if this is the Eclipse slot
        const isEclipseSlot = booking.timeSlot?.isSpecialEclipseSlot || false;

        // Format the time slot string
        let timeSlotString;
        if (isEclipseSlot) {
          timeSlotString = "Midnight";
        } else {
          timeSlotString = `${booking.timeSlot.startTime} - ${booking.timeSlot.endTime} IST`;
        }

        // Ensure the data format matches what the backend expects
        const bookingData = {
          phoneNumber: user.phoneNumber,
          name: user.name,
          courtNumber: booking.court.id,
          date: booking.date!.toISOString(),
          timeSlotString,
          numberOfPlayers: booking.details!.players || 4,
          notes: booking.details!.notes || "",
          totalAmount: booking.details!.totalAmount || 0,
          isEclipseSlot,
        };

        console.log("Sending booking data:", bookingData);

        // Call createBooking with separate parameters instead of an object
        const savedBooking = await createBooking(
          bookingData.phoneNumber,
          bookingData.name,
          bookingData.courtNumber,
          bookingData.date,
          bookingData.timeSlotString,
          bookingData.numberOfPlayers,
          bookingData.notes,
          bookingData.totalAmount,
          bookingData.isEclipseSlot
        );

        setIsSaved(true);
        console.log("Booking saved to backend:", savedBooking);
      } catch (error) {
        console.error("Error saving booking:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to save booking to server. Please try again."
        );
        toast.error("Failed to save booking to server. Please try again.");
      } finally {
        setIsSaving(false);
        setIsLoading(false);
      }
    };

    saveBookingToBackend();
  }, [booking, navigate, isSaved]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Eclipse Pickleball Booking",
        text: `I've booked a pickleball court at ${
          booking.location?.name
        } on ${format(booking.date!, "MMMM d")} at ${
          booking.timeSlot?.startTime
        }`,
        url: window.location.href,
      });
    }
  };

  const handleOpenMaps = () => {
    // Open Google Maps with Eclipse Pickleball location
    window.open("https://maps.app.goo.gl/2ZAdPuCNBiUc6PxUA", "_blank");
  };

  const handleSave = async () => {
    if (!bookingCardRef.current) return;

    try {
      // Show toast or feedback
      const feedbackEl = document.createElement("div");
      feedbackEl.className =
        "fixed top-0 left-0 right-0 bg-black text-white text-center py-2 z-50";
      feedbackEl.textContent = "Taking screenshot...";
      document.body.appendChild(feedbackEl);

      // Small delay to allow the feedback message to show
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Take screenshot
      const canvas = await html2canvas(bookingCardRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
      });

      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Failed to create blob");
          return;
        }

        // Create a temporary anchor element and trigger download
        const link = document.createElement("a");
        link.download = `booking-${bookingCode}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();

        // Clean up
        URL.revokeObjectURL(link.href);

        // Remove feedback
        document.body.removeChild(feedbackEl);

        // Show success message
        const successEl = document.createElement("div");
        successEl.className =
          "fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-2 z-50";
        successEl.textContent = "Screenshot saved to your device!";
        document.body.appendChild(successEl);

        // Remove success message after a delay
        setTimeout(() => {
          document.body.removeChild(successEl);
        }, 2000);
      }, "image/png");
    } catch (error) {
      console.error("Screenshot failed:", error);
      alert("Failed to save screenshot. Please try again.");
    }
  };

  const handleTryAgain = () => {
    resetBooking();
    navigate("/");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="page-container bg-[#f2e8dc] flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-md text-center max-w-md">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Processing Your Booking</h2>
          <p className="text-gray-600 mb-4">
            Please wait while we confirm your reservation with our server...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-pink-400 to-amber-300 h-2 rounded-full animate-pulse"
              style={{ width: "80%" }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">This may take a few moments</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="page-container bg-[#f2e8dc] flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-md text-center max-w-md">
          <div className="bg-red-100 p-3 rounded-full inline-flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Booking Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleTryAgain} variant="cosmic" className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (
    !booking.id ||
    !booking.location ||
    !booking.date ||
    !booking.timeSlot ||
    !booking.court ||
    !booking.details
  ) {
    return null;
  }

  return (
    <div className="page-container bg-[#f2e8dc]">
      <div className="content-with-sticky-button pb-12 px-4 md:px-6">
        <div className="p-4 md:p-6 rounded-3xl bg-[#fffbe1] mb-8 max-w-lg mx-auto">
          {isSaving && (
            <div className="text-center mb-4 text-sm bg-blue-100 text-blue-800 p-2 rounded flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving your booking to the server...
            </div>
          )}

          <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">
            YOUR BOOKING
          </h2>

          <div
            ref={bookingCardRef}
            className="relative bg-[#d8ebc7] rounded-3xl p-4 md:p-6 pt-8 md:pt-12 pb-16 flex flex-col items-center mx-auto"
          >
            {/* Logo at top of pass */}
            <div className="mb-4 text-center">
              <h3 className="text-xl md:text-2xl font-bold">Eclipse Vesu</h3>
              <p className="text-xs uppercase tracking-wider">BOOKING PASS</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center mb-4 md:mb-6 w-full">
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase">COURT</span>
                <span className="font-bold text-lg">{booking.court.id}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase">LOCATION</span>
                <span className="font-bold text-sm">Eclipse Milky Way</span>
                <span className="text-xs">Vesu Surat</span>
              </div>
            </div>

            <div className="text-center mb-4 md:mb-6">
              <p className="text-xs mb-2">This booking pass belongs to</p>
              <h3 className="text-xl md:text-2xl font-bold mb-4">
                {booking.details.name.toUpperCase()}
              </h3>

              <div className="inline-flex bg-[#383838] rounded-full px-3 md:px-4 py-1 text-xs text-white">
                <span className="mr-2 md:mr-4">
                  {format(booking.date, "dd MMM").toUpperCase()}
                </span>
                <span className="mr-2 md:mr-4">
                  {formatTimeToIST(booking.timeSlot.startTime)}
                </span>
                <span>{formatTimeToIST(booking.timeSlot.endTime)}</span>
                <span className="ml-2">IST</span>
              </div>
            </div>

            {/* Total Amount */}
            <div className="mb-4 text-center">
              <div className="bg-black/10 rounded-lg p-2 inline-block">
                <p className="text-sm font-semibold">
                  Total Amount: ₹{booking.details.totalAmount || 0}
                </p>
              </div>
            </div>

            {/* QR Code for booking */}
            <div className="mb-4 text-center">
              <div className="bg-white p-2 rounded-lg inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${bookingCode}`}
                  alt="Booking QR Code"
                  className="w-20 h-20 md:w-24 md:h-24"
                />
              </div>
              <p className="text-sm font-semibold mt-1">
                Booking #: {bookingCode}
              </p>
            </div>

            <p className="text-[10px] text-center max-w-[200px] text-gray-600">
              May cause extreme fun, sore muscles, and an addiction to saying
              "ECLIPSE!"
            </p>

            {/* Pickleball racket element - hidden on small screens */}
            <div className="absolute -right-8 md:-right-12 -top-8 md:-top-12 w-24 md:w-32 h-24 md:h-32 transform rotate-12 hidden sm:block">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {/* Handle */}
                <rect
                  x="45"
                  y="60"
                  width="10"
                  height="40"
                  rx="5"
                  fill="#583A27"
                />
                {/* Racket head */}
                <circle
                  cx="50"
                  cy="40"
                  r="30"
                  fill="#FFF"
                  stroke="#583A27"
                  strokeWidth="3"
                />
                {/* Holes pattern */}
                <circle cx="40" cy="30" r="3" fill="#583A27" />
                <circle cx="50" cy="30" r="3" fill="#583A27" />
                <circle cx="60" cy="30" r="3" fill="#583A27" />
                <circle cx="35" cy="40" r="3" fill="#583A27" />
                <circle cx="45" cy="40" r="3" fill="#583A27" />
                <circle cx="55" cy="40" r="3" fill="#583A27" />
                <circle cx="65" cy="40" r="3" fill="#583A27" />
                <circle cx="40" cy="50" r="3" fill="#583A27" />
                <circle cx="50" cy="50" r="3" fill="#583A27" />
                <circle cx="60" cy="50" r="3" fill="#583A27" />
              </svg>
            </div>

            {/* Wave cut at bottom */}
            <div className="absolute left-0 right-0 bottom-0 h-8 overflow-hidden">
              <div className="w-full h-16 bg-[#f2e8dc] rounded-[50%] relative top-8"></div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 md:gap-4 justify-center">
          <Button
            onClick={handleSave}
            variant="outline"
            className="border-2 border-black rounded-full px-4 md:px-6 py-2 bg-white text-black flex items-center"
          >
            <Download className="mr-1 md:mr-2 w-4 h-4" /> SAVE
          </Button>

          <Button
            onClick={handleOpenMaps}
            variant="outline"
            className="border-2 border-black rounded-full px-4 md:px-6 py-2 bg-white text-black flex items-center"
          >
            ROUTE ME <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </div>

        <div className="text-center mt-6 text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} Eclipse Pickleball. All rights
            reserved.
          </p>
          <p className="mt-1">
            Developed by{" "}
            <a
              href="https://imhoteph.com/#home"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              imhoteph.com
            </a>
          </p>
        </div>
      </div>

      <div className="sticky-button-container flex items-center justify-center">
        <Button
          onClick={() => {
            resetBooking();
            navigate("/");
          }}
          variant="cosmic"
          size="cosmic"
          className="w-[90%] max-w-xs"
        >
          <span>BOOK ANOTHER COURT</span>
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
