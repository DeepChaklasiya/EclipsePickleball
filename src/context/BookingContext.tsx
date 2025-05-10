import React, { createContext, useContext, useState, ReactNode } from "react";

// Location type
export interface Location {
  id: string;
  name: string;
  address?: string;
  image?: string;
  status?: string;
}

// Time slot type
export interface TimeSlot {
  id?: string;
  startTime: string;
  endTime: string;
  section?: string;
}

// Court type
export interface Court {
  id: string;
  name: string;
  image?: string;
  color?: string;
  description?: string;
  icon?: React.ReactNode;
}

// Booking details type
export interface BookingDetails {
  name: string;
  email: string;
  phoneNumber: string;
  players: number;
  notes?: string;
}

// Booking type
export interface Booking {
  id?: string;
  location?: Location;
  date?: Date;
  timeSlot?: TimeSlot;
  court?: Court;
  details?: BookingDetails;
}

interface BookingContextType {
  booking: Booking;
  locations: Location[];
  timeSlots: TimeSlot[];
  courts: Court[];
  setBookingLocation: (location: Location) => void;
  setBookingDate: (date: Date) => void;
  setBookingTimeSlot: (timeSlot: TimeSlot) => void;
  setBookingCourt: (court: Court) => void;
  setBookingDetails: (details: BookingDetails) => void;
  resetBooking: () => void;
}

// Sample data
const sampleLocations: Location[] = [
  {
    id: "1",
    name: "Eclipse",
    address:
      " Opp. Dream World Residency, G.D. Goenka School Road, Canal Road, Vesu, Surat, Gujarat 395007",
    image:
      "https://res.cloudinary.com/djbfmsyki/image/upload/v1746794916/Capture_jmrn1e.jpg",
  },
  // {
  //   id: '2',
  //   name: 'Eclipse Andromeda',
  //   address: 'Coming soon.....',
  //   image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  // }
  // {
  //   id: '3',
  //   name: 'Eclipse Westside',
  //   address: '789 Pine St, Westside',
  //   image: 'https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  // }
];

const sampleTimeSlots: TimeSlot[] = [
  { id: "1", startTime: "08:00", endTime: "09:00" },
  { id: "2", startTime: "09:00", endTime: "10:00" },
  { id: "3", startTime: "10:00", endTime: "11:00" },
  { id: "4", startTime: "11:00", endTime: "12:00" },
  { id: "5", startTime: "13:00", endTime: "14:00" },
  { id: "6", startTime: "14:00", endTime: "15:00" },
  { id: "7", startTime: "15:00", endTime: "16:00" },
  { id: "8", startTime: "16:00", endTime: "17:00" },
  { id: "9", startTime: "17:00", endTime: "18:00" },
];

const sampleCourts: Court[] = [
  {
    id: "1",
    name: "Court 1",
    image:
      "https://images.unsplash.com/photo-1687905330600-d5ba392b48a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  },
  {
    id: "2",
    name: "Court 2",
    image:
      "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  },
  {
    id: "3",
    name: "Court 3",
    image:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  },
  {
    id: "4",
    name: "Court 4",
    image:
      "https://images.unsplash.com/photo-1534158914592-062992fbe900?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  },
];

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [booking, setBooking] = useState<Booking>({});

  const setBookingLocation = (location: Location) => {
    setBooking((prev) => ({ ...prev, location }));
  };

  const setBookingDate = (date: Date) => {
    setBooking((prev) => ({ ...prev, date }));
  };

  const setBookingTimeSlot = (timeSlot: TimeSlot) => {
    setBooking((prev) => ({ ...prev, timeSlot }));
  };

  const setBookingCourt = (court: Court) => {
    setBooking((prev) => ({ ...prev, court }));
  };

  const setBookingDetails = (details: BookingDetails) => {
    const bookingWithDetails = {
      ...booking,
      details,
      id: `booking-${Date.now()}`,
    };
    setBooking(bookingWithDetails);
  };

  const resetBooking = () => {
    setBooking({});
  };

  return (
    <BookingContext.Provider
      value={{
        booking,
        locations: sampleLocations,
        timeSlots: sampleTimeSlots,
        courts: sampleCourts,
        setBookingLocation,
        setBookingDate,
        setBookingTimeSlot,
        setBookingCourt,
        setBookingDetails,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
