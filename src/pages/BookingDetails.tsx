import { useState } from "react";
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
import { useBooking, BookingDetails as BookingDetailsType } from "@/context/BookingContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Calendar, Clock, Users } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  players: z.string().min(1, { message: "Number of players is required" }),
  notes: z.string().optional(),
});

const BookingDetailsPage = () => {
  const navigate = useNavigate();
  const { booking, setBookingDetails } = useBooking();
  const [couponCode, setCouponCode] = useState("");

  // Initialize form with existing booking details if available
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: booking?.details?.name || "",
      email: booking?.details?.email || "",
      phoneNumber: booking?.details?.phoneNumber || "",
      players: booking?.details?.players?.toString() || "",
      notes: booking?.details?.notes || "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const details: BookingDetailsType = {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      players: parseInt(data.players),
      notes: data.notes,
    };

    setBookingDetails(details);
    navigate("/booking-confirmation");
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePayAtCourt = () => {
    // Use the form data for the name and players
    const formData = form.getValues();
    
    const details: BookingDetailsType = {
      name: formData.name || "Guest",
      email: formData.email || "",
      phoneNumber: formData.phoneNumber || "",
      players: parseInt(formData.players || "2"),
      notes: formData.notes || "",
    };

    setBookingDetails(details);
    navigate("/booking-confirmation");
  };

  // Format court display name
  const getCourtDisplayName = () => {
    if (!booking.court) return "";
    return `OUTDOOR | ${booking.court.id}`;
  };

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
                {booking.date ? format(booking.date, "EEE, dd MMM").toUpperCase() : "---"}
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span className="text-gray-600">TIME</span>
              </div>
              <div className="font-medium text-right">
                {booking.timeSlot?.startTime || "---"}
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <Users className="w-5 h-5 mr-2" />
                <span className="text-gray-600">NO. OF PLAYERS</span>
              </div>
              <div className="font-medium text-right">
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="players"
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-20 h-8 bg-transparent border-none focus:ring-0 text-right pr-0">
                            <SelectValue placeholder="?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Form>
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="text-gray-600">BOOKING BY</span>
              </div>
              <div className="font-medium text-right">
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormControl>
                        <Input 
                          placeholder="Your name" 
                          {...field} 
                          className="w-40 h-8 bg-transparent border-none focus:ring-0 text-right pr-0 placeholder:text-gray-400"
                        />
                      </FormControl>
                    )}
                  />
                </Form>
              </div>
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Your email" type="email" {...field} />
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
                        <Input placeholder="Your phone number" type="tel" {...field} />
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
          className="w-[90%] max-w-xs"
        >
          <span>PAY AT COURT</span>
        </Button>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
