import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BookingProvider } from "./context/BookingContext";
import RefreshGuardProvider from "./providers/RefreshGuardProvider";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import LocationSelect from "./pages/LocationSelect";
import DateTimeSelect from "./pages/DateTimeSelect";
import CourtSelect from "./pages/CourtSelect";
import BookingDetails from "./pages/BookingDetails";
import BookingConfirmation from "./pages/BookingConfirmation";
import BookingHistory from "./pages/BookingHistory";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BookingProvider>
      <RefreshGuardProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-eclipse-dark">
              <Navbar />
              <div className="pt-14">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route
                    path="/location-select"
                    element={
                      <ProtectedRoute>
                        <LocationSelect />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/date-time-select"
                    element={
                      <ProtectedRoute>
                        <DateTimeSelect />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/court-select"
                    element={
                      <ProtectedRoute>
                        <CourtSelect />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/booking-details"
                    element={
                      <ProtectedRoute>
                        <BookingDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/booking-confirmation"
                    element={
                      <ProtectedRoute>
                        <BookingConfirmation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/booking-history"
                    element={
                      <ProtectedRoute>
                        <BookingHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </RefreshGuardProvider>
    </BookingProvider>
  </QueryClientProvider>
);

export default App;
