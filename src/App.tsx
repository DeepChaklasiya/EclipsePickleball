import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BookingProvider } from "./context/BookingContext";
import Navbar from "./components/Navbar";

// Pages
import Index from "./pages/Index";
import LocationSelect from "./pages/LocationSelect";
import DateTimeSelect from "./pages/DateTimeSelect";
import CourtSelect from "./pages/CourtSelect";
import BookingDetails from "./pages/BookingDetails";
import BookingConfirmation from "./pages/BookingConfirmation";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BookingProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-eclipse-dark">
            <Navbar />
            <div className="pt-14">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/location-select" element={<LocationSelect />} />
                <Route path="/date-time-select" element={<DateTimeSelect />} />
                <Route path="/court-select" element={<CourtSelect />} />
                <Route path="/booking-details" element={<BookingDetails />} />
                <Route
                  path="/booking-confirmation"
                  element={<BookingConfirmation />}
                />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </BookingProvider>
  </QueryClientProvider>
);

export default App;
