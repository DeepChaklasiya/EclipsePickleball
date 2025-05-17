import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth";
import { getUserBookings, BookingData } from "@/lib/api";
import { formatTimeRangeIST } from "@/lib/utils";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BookingHistory = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const user = getUser();

        if (!user) {
          // If no user is logged in, redirect to home page
          navigate("/");
          return;
        }

        const userBookings = await getUserBookings(user.phoneNumber);
        setBookings(userBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError(
          "Failed to load your booking history. Please try again later."
        );
        toast.error("Could not load your bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  // Group bookings by upcoming and past
  const upcomingBookings = bookings.filter(
    (booking) => !isPast(new Date(booking.date))
  );
  const pastBookings = bookings.filter((booking) =>
    isPast(new Date(booking.date))
  );

  return (
    <div className="page-container bg-eclipse-dark text-white min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-pink-300 to-amber-200 bg-clip-text text-transparent">
          Booking History
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-pink-400" />
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-center">
            <p>{error}</p>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="mt-4 border-pink-500/40 text-white hover:bg-pink-500/10"
            >
              Back to Home
            </Button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-gray-800/50 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No Bookings Found</h2>
            <p className="text-gray-400 mb-6">
              You haven't made any bookings yet.
            </p>
            <Button onClick={() => navigate("/")} variant="cosmic" size="sm">
              Book a Court
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 border-b border-pink-500/40 pb-2">
                  Upcoming Bookings
                </h2>
                <div className="grid gap-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} />
                  ))}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
                  Past Bookings
                </h2>
                <div className="grid gap-4">
                  {pastBookings.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} isPast />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate(-1)}
            className="border-pink-400/40 text-white hover:bg-pink-500/10 mr-4"
          >
            Back
          </Button>
          <Button onClick={() => navigate("/")} variant="cosmic" size="sm">
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

// Booking card component
interface BookingCardProps {
  booking: BookingData;
  isPast?: boolean;
}

const BookingCard = ({ booking, isPast = false }: BookingCardProps) => {
  const bookingDate = new Date(booking.date);

  // Get court display name - handle both direct courtNumber and nested court.name
  const getCourtDisplayName = () => {
    if (booking.courtNumber) {
      return `${booking.courtNumber}`;
    } else if (booking.court?.name) {
      return booking.court.name;
    } else {
      return "Unknown";
    }
  };

  // Get time slot display
  const getTimeDisplay = () => {
    if (booking.startTime && booking.endTime) {
      return formatTimeRangeIST(booking.startTime, booking.endTime);
    } else if (booking.timeSlot?.startTime && booking.timeSlot?.endTime) {
      return formatTimeRangeIST(
        booking.timeSlot.startTime,
        booking.timeSlot.endTime
      );
    } else {
      return "Midnight Slot (12 AM - 1 AM)";
    }
  };

  return (
    <div
      className={`bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/50 transition-all border-l-4 ${
        isPast ? "border-gray-600" : "border-pink-500"
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center text-lg font-medium mb-1">
            <span>Court {getCourtDisplayName()}</span>
            {!isPast && (
              <span className="ml-3 text-xs bg-green-900/60 text-green-300 px-2 py-0.5 rounded-full">
                {booking.status}
              </span>
            )}
          </div>

          <div className="text-sm text-gray-400 space-y-1">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{format(bookingDate, "EEEE, MMM d, yyyy")}</span>
            </div>

            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{getTimeDisplay()}</span>
            </div>

            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{booking.court?.location || "Eclipse Pickleball"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-xs bg-gray-900 text-gray-400 px-2 py-1 rounded mb-2">
            #{booking.bookingCode}
          </div>

          <div className="text-lg font-bold text-amber-300">
            ₹{booking.totalAmount}
          </div>

          <div className="text-xs text-gray-400">
            {booking.paymentStatus === "pay-at-court"
              ? "Pay at Court"
              : booking.paymentStatus || "Pay at Court"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
