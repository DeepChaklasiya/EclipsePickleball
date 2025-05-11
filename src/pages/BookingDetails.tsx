import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Header from "@/components/Header";
import BookingSteps from "@/components/BookingSteps";
import {
  useBooking,
  BookingDetails as BookingDetailsType,
} from "@/context/BookingContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, MapPin, Calendar, Clock } from "lucide-react";
import { getUser } from "@/lib/auth";
import { createBooking } from "@/lib/api";
import { toast } from "sonner";
import { formatTimeRangeIST } from "@/lib/utils";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 characters" }),
  players: z.number().min(1).max(6).default(4),
  notes: z.string().optional(),
});

const BookingDetailsPage = () => {
  const navigate = useNavigate();
  const { booking, setBookingDetails } = useBooking();
  const [couponCode, setCouponCode] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonHighlighted, setButtonHighlighted] = useState(false);

  // Get user from local storage
  useEffect(() => {
    const user = getUser();
    if (user) {
      setUserName(user.name || "");
    }
  }, []);

  // Initialize form with existing booking details if available
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: userName || booking?.details?.name || "",
      email: booking?.details?.email || "",
      phoneNumber: booking?.details?.phoneNumber || "",
      players: booking?.details?.players || 4,
      notes: booking?.details?.notes || "",
    },
  });

  // Update form when userName changes from localStorage
  useEffect(() => {
    if (userName) {
      form.setValue("name", userName);
    }
  }, [userName, form]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isSubmitting) {
      try {
        setIsSubmitting(true); // Update booking with details
        setBookingDetails({
          name: form.getValues().name,
          email: form.getValues().email,
          phoneNumber: form.getValues().phoneNumber,
          players: form.getValues().players || 4,
          notes: form.getValues().notes,
        });

        toast.success("Booking successful!");
        navigate("/booking-confirmation");
      } catch (error) {
        console.error("Booking error:", error);
        toast.error(
          error.message || "Failed to create booking. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePayAtCourt = () => {
    // Use the form data for the name
    const formData = form.getValues();

    const details: BookingDetailsType = {
      name: formData.name || userName || "Guest",
      email: formData.email || "",
      phoneNumber: formData.phoneNumber || "",
      notes: formData.notes || "",
      players: 4,
    };

    // Briefly flash button animation
    setButtonHighlighted(true);
    setTimeout(() => setButtonHighlighted(false), 1000);

    setBookingDetails(details);
    navigate("/booking-confirmation");
  };

  // Format court display name
  const getCourtDisplayName = () => {
    if (!booking.court) return "";
    return `OUTDOOR | ${booking.court.id}`;
  };

  // Add effect to show button animation on first load
  useEffect(() => {
    if (booking.court) {
      setButtonHighlighted(true);
      setTimeout(() => setButtonHighlighted(false), 1000);
    }
  }, []);

  return (
    <div className="page-container bg-[#f2e8dc]">
      <div className="content-with-sticky-button">
        {/* <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold">ANY COURT YOU PREFER?</div>
          <div className="text-xl font-semibold">
            <span className="text-primary">03</span>/03
          </div>
        </div> */}

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold">CONFIRM YOUR DETAILS</h2>
            </div>
          </div>

          <div className="bg-[#f5f5f5] rounded-lg py-2 px-4 mb-6 text-center">
            <div className="font-medium">BOOKING DETAILS</div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-gray-600">LOCATION</span>
              </div>
              <div className="font-medium text-right">
                {booking.location?.name || "---"}
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="text-gray-600">DATE</span>
              </div>
              <div className="font-medium text-right">
                {booking.date
                  ? format(booking.date, "EEE, dd MMM").toUpperCase()
                  : "---"}
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span className="text-gray-600">TIME</span>
              </div>
              <div className="font-medium text-right">
                {booking.timeSlot
                  ? formatTimeRangeIST(
                      booking.timeSlot.startTime,
                      booking.timeSlot.endTime
                    )
                  : "---"}
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
                <span className="text-gray-600">COURT</span>
              </div>
              <div className="font-medium text-right">
                {getCourtDisplayName() || "---"}
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="text-gray-600">BOOKING BY</span>
              </div>
              <div className="font-medium text-right">{userName || "---"}</div>
            </div>
          </div>

          <div className="flex items-center mb-6">
            <input
              type="text"
              placeholder="Your coupon code"
              className="flex-grow border rounded-l-lg px-3 py-2 focus:outline-none"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button className="bg-[#3a3a3a] text-white px-4 py-2 rounded-r-lg">
              APPLY
            </button>
          </div>

          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Total amount</span>
            <span>₹800</span>
          </div>

          {/* Hidden form fields */}
          <div className="hidden">
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your email"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your phone number"
                          type="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="players"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Players</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          defaultValue={field.value?.toString() || "4"}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of players" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Player</SelectItem>
                            <SelectItem value="2">2 Players</SelectItem>
                            <SelectItem value="3">3 Players</SelectItem>
                            <SelectItem value="4">4 Players</SelectItem>
                            <SelectItem value="5">5 Players</SelectItem>
                            <SelectItem value="6">6 Players</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special requests or information"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>
      </div>

      <div className="sticky-button-container flex items-center justify-center">
        <Button
          onClick={handlePayAtCourt}
          variant="cosmic"
          size="cosmic"
          className={cn(
            "w-[90%] max-w-xs relative group",
            buttonHighlighted && "animate-pulse shadow-lg"
          )}
        >
          <span className="flex items-center justify-center">
            PAY AT COURT
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={cn(
                "h-5 w-5 ml-2 transition-transform group-hover:translate-x-1",
                buttonHighlighted && "animate-bounce"
              )}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </Button>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
