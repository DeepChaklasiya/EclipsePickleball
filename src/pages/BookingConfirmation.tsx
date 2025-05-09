import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Check, Map, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useBooking } from "@/context/BookingContext";
import html2canvas from 'html2canvas';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { booking, resetBooking } = useBooking();
  const [bookingCode, setBookingCode] = useState('');
  const bookingCardRef = useRef<HTMLDivElement>(null);

  // Generate random booking code
  useEffect(() => {
    const generateBookingCode = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const codeLength = 8;
      let result = '';
      
      for (let i = 0; i < codeLength; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      return result;
    };
    
    setBookingCode(generateBookingCode());
  }, []);

  // Redirect to home if no booking details exist
  useEffect(() => {
    if (!booking.id || !booking.location || !booking.date || !booking.timeSlot || !booking.court || !booking.details) {
      navigate("/");
    }
  }, [booking, navigate]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Eclipse Pickleball Booking",
        text: `I've booked a pickleball court at ${booking.location?.name} on ${format(booking.date!, "MMMM d")} at ${booking.timeSlot?.startTime}`,
        url: window.location.href,
      });
    }
  };

  const handleSave = async () => {
    if (!bookingCardRef.current) return;
    
    try {
      // Show toast or feedback
      const feedbackEl = document.createElement('div');
      feedbackEl.className = 'fixed top-0 left-0 right-0 bg-black text-white text-center py-2 z-50';
      feedbackEl.textContent = 'Taking screenshot...';
      document.body.appendChild(feedbackEl);
      
      // Small delay to allow the feedback message to show
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Take screenshot
      const canvas = await html2canvas(bookingCardRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
      });
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob');
          return;
        }
        
        // Create a temporary anchor element and trigger download
        const link = document.createElement('a');
        link.download = `booking-${bookingCode}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        
        // Clean up
        URL.revokeObjectURL(link.href);
        
        // Remove feedback
        document.body.removeChild(feedbackEl);
        
        // Show success message
        const successEl = document.createElement('div');
        successEl.className = 'fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-2 z-50';
        successEl.textContent = 'Screenshot saved to your device!';
        document.body.appendChild(successEl);
        
        // Remove success message after a delay
        setTimeout(() => {
          document.body.removeChild(successEl);
        }, 2000);
      }, 'image/png');
      
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Failed to save screenshot. Please try again.');
    }
  };

  if (!booking.id || !booking.location || !booking.date || !booking.timeSlot || !booking.court || !booking.details) {
    return null;
  }

  return (
    <div className="page-container bg-[#f2e8dc]">
      <div className="content-with-sticky-button pb-12">
        <div className="flex items-center justify-between mb-4">
          <img 
            src="/lovable-uploads/5bbf4ffd-5c67-4c94-97cd-2b7b4be77de8.png"
            alt="Bink Logo"
            className="h-8"
          />
          <div className="flex gap-4">
            <button className="text-gray-700">YOUR PROFILE</button>
            <button className="text-gray-700">PLAY</button>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#fffbe1] mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">YOUR BOOKING</h2>
          
          <div ref={bookingCardRef} className="relative bg-[#d8ebc7] rounded-3xl p-6 pt-12 pb-16 flex flex-col items-center mx-auto max-w-sm">
            {/* Logo at top of pass */}
            <div className="mb-4 text-center">
              <h3 className="text-2xl font-bold">Eclipse Vesu</h3>
              <p className="text-xs uppercase tracking-wider">BOOKING PASS</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center mb-6 w-full">
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
            
            <div className="text-center mb-6">
              <p className="text-xs mb-2">This booking pass belongs to</p>
              <h3 className="text-2xl font-bold mb-4">{booking.details.name.toUpperCase()}</h3>
              
              <div className="inline-flex bg-[#383838] rounded-full px-4 py-1 text-xs text-white">
                <span className="mr-4">{format(booking.date, "dd MMMM").toUpperCase()}</span>
                <span className="mr-4">{booking.timeSlot.startTime} PM</span>
                <span>{booking.timeSlot.endTime} PM</span>
              </div>
            </div>
            
            {/* QR Code for booking */}
            <div className="mb-4 text-center">
              <div className="bg-white p-2 rounded-lg inline-block">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${bookingCode}`} 
                  alt="Booking QR Code" 
                  className="w-24 h-24"
                />
              </div>
              <p className="text-sm font-semibold mt-1">Booking #: {bookingCode}</p>
            </div>
            
            <p className="text-[10px] text-center max-w-[200px] text-gray-600">
              May cause extreme fun, sore muscles, and an addiction to saying "DINK!"
            </p>
            
            {/* Pickleball racket element */}
            <div className="absolute -right-12 -top-12 w-32 h-32 transform rotate-12">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {/* Handle */}
                <rect x="45" y="60" width="10" height="40" rx="5" fill="#583A27" />
                {/* Racket head */}
                <circle cx="50" cy="40" r="30" fill="#FFF" stroke="#583A27" strokeWidth="3" />
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
        
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={handleSave}
            variant="outline"
            className="border-2 border-black rounded-full px-6 py-2 bg-white text-black flex items-center"
          >
            <Download className="mr-2 w-4 h-4" /> SAVE
          </Button>
          
          <Button 
            variant="outline"
            className="border-2 border-black rounded-full px-6 py-2 bg-white text-black flex items-center"
          >
            ROUTE ME <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="sticky-button-container flex items-center justify-center">
        <Button 
          onClick={() => navigate("/")} 
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
