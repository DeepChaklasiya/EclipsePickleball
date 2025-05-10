import { useState, useEffect } from "react";
import { format, isValid, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Download,
  RefreshCcw,
  Search,
  X,
  Lock,
  AlertCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define booking type based on the backend model
interface Booking {
  _id: string;
  name: string;
  phoneNumber: string;
  courtNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPlayers: number;
  notes?: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const ADMIN_PASSWORD = "8140552219";

const Admin = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [courtFilter, setCourtFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState<boolean>(true);
  const [passwordError, setPasswordError] = useState<string>("");

  // Check for existing authentication on component mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("adminAuthenticated");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      setShowPasswordDialog(false);
    }
  }, []);

  // Fetch all bookings with optional filters
  const {
    data: bookingsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-bookings", startDate, endDate, statusFilter, courtFilter],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (startDate) {
        params.append("startDate", startDate.toISOString());
      }

      if (endDate) {
        params.append("endDate", endDate.toISOString());
      }

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (courtFilter && courtFilter !== "all") {
        params.append("courtNumber", courtFilter);
      }

      const response = await axios.get(`${API_URL}/bookings`, { params });
      return response.data;
    },
    enabled: isAuthenticated, // Only run query if authenticated
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, "MMM dd, yyyy") : "Invalid date";
    } catch (error) {
      return "Invalid date";
    }
  };

  // Filter bookings by search query on name or phone number
  const filteredBookings =
    bookingsData?.data?.bookings.filter((booking: Booking) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        booking.name.toLowerCase().includes(query) ||
        booking.phoneNumber.includes(query)
      );
    }) || [];

  // Calculate stats
  const totalBookings = bookingsData?.data?.bookings?.length || 0;
  const confirmedBookings =
    bookingsData?.data?.bookings?.filter(
      (b: Booking) => b.status === "confirmed"
    ).length || 0;
  const cancelledBookings =
    bookingsData?.data?.bookings?.filter(
      (b: Booking) => b.status === "cancelled"
    ).length || 0;

  // Group bookings by court
  const bookingsByCourt =
    bookingsData?.data?.bookings?.reduce(
      (acc: Record<string, number>, booking: Booking) => {
        const courtKey = `Court ${booking.courtNumber}`;
        acc[courtKey] = (acc[courtKey] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || ({} as Record<string, number>);

  // Reset all filters
  const resetFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setCourtFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  // Export bookings as CSV
  const exportCSV = () => {
    if (!filteredBookings.length) return;

    const headers = [
      "Name",
      "Phone",
      "Court",
      "Date",
      "Start Time",
      "End Time",
      "Players",
      "Status",
      "Notes",
    ];

    const csvRows = [
      headers.join(","),
      ...filteredBookings.map((booking: Booking) => {
        const row = [
          `"${booking.name}"`,
          `"${booking.phoneNumber}"`,
          booking.courtNumber,
          formatDate(booking.date),
          booking.startTime,
          booking.endTime,
          booking.numberOfPlayers,
          booking.status,
          `"${booking.notes || ""}"`,
        ];
        return row.join(",");
      }),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = format(new Date(), "yyyy-MM-dd");

    link.setAttribute("href", url);
    link.setAttribute("download", `bookings-${timestamp}.csv`);
    link.click();
  };

  // Password dialog component as a separate function
  const PasswordDialog = () => {
    // Use a local state for the input to avoid potential issues
    const [localPassword, setLocalPassword] = useState("");

    const handleSubmit = () => {
      if (localPassword === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
        setShowPasswordDialog(false);
        setPasswordError("");
        // Save authentication to session storage
        sessionStorage.setItem("adminAuthenticated", "true");
      } else {
        setPasswordError("Incorrect password. Please try again.");
        setLocalPassword(""); // Clear password field on error
      }
    };

    const handleOpenChange = (open: boolean) => {
      if (!open) {
        // If dialog is closing and user is not authenticated, redirect to home
        if (!isAuthenticated) {
          navigate("/");
        } else {
          setShowPasswordDialog(false);
        }
      } else {
        setShowPasswordDialog(true);
      }
    };

    return (
      <Dialog open={showPasswordDialog} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Admin Authentication Required
            </DialogTitle>
            <DialogDescription>
              Please enter the admin password to access this page.
            </DialogDescription>
          </DialogHeader>

          {passwordError && (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-4 py-2">
            <Input
              type="password"
              placeholder="Enter password"
              value={localPassword}
              onChange={(e) => setLocalPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className="w-full"
              autoFocus
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="default"
                onClick={handleSubmit}
                className="flex-1"
              >
                Submit
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <PasswordDialog />

      {isAuthenticated && (
        <div className="container mx-auto py-4 px-2 sm:px-4 sm:py-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Admin Dashboard
            </h1>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                className="flex-1 sm:flex-auto"
                variant="outline"
                onClick={() => refetch()}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                className="flex-1 sm:flex-auto"
                variant="outline"
                onClick={exportCSV}
                disabled={!filteredBookings.length}
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <Card>
              <CardHeader className="pb-2 px-4">
                <CardTitle className="text-sm font-medium">
                  Total Bookings
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-2">
                <div className="text-2xl font-bold">{totalBookings}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 px-4">
                <CardTitle className="text-sm font-medium">
                  Confirmed Bookings
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-2">
                <div className="text-2xl font-bold text-green-500">
                  {confirmedBookings}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 px-4">
                <CardTitle className="text-sm font-medium">
                  Cancelled Bookings
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-2">
                <div className="text-2xl font-bold text-red-500">
                  {cancelledBookings}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="mb-6 w-full sm:w-auto flex">
              <TabsTrigger value="bookings" className="flex-1 sm:flex-auto">
                All Bookings
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex-1 sm:flex-auto">
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookings">
              {/* Filters */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="w-full">
                      <div className="mb-2 text-sm">
                        Search by Name or Phone
                      </div>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                          <X
                            className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
                            onClick={() => setSearchQuery("")}
                          />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="w-full">
                        <div className="mb-2 text-sm">Start Date</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate
                                ? format(startDate, "PPP")
                                : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="w-full">
                        <div className="mb-2 text-sm">End Date</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="mb-2 text-sm">Court</div>
                        <Select
                          value={courtFilter}
                          onValueChange={setCourtFilter}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Courts" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Courts</SelectItem>
                            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                Court {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <div className="mb-2 text-sm">Status</div>
                        <Select
                          value={statusFilter}
                          onValueChange={setStatusFilter}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" onClick={resetFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Bookings Table */}
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2">Loading bookings...</p>
                      </div>
                    </div>
                  ) : isError ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-center text-red-500">
                        <p>Error loading bookings. Please try again.</p>
                        <Button
                          variant="outline"
                          onClick={() => refetch()}
                          className="mt-2"
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-center">
                        <p>No bookings found matching the criteria.</p>
                        {(startDate ||
                          endDate ||
                          courtFilter !== "all" ||
                          statusFilter !== "all" ||
                          searchQuery) && (
                          <Button
                            variant="outline"
                            onClick={resetFilters}
                            className="mt-2"
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableCaption>
                          Showing {filteredBookings.length} of {totalBookings}{" "}
                          bookings
                        </TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="hidden sm:table-cell">
                              Name
                            </TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="hidden md:table-cell">
                              Court
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                              Date
                            </TableHead>
                            <TableHead className="hidden sm:table-cell">
                              Time
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                              Players
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden lg:table-cell">
                              Notes
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredBookings.map((booking: Booking) => (
                            <TableRow key={booking._id}>
                              <TableCell className="hidden sm:table-cell font-medium">
                                {booking.name}
                              </TableCell>
                              <TableCell>
                                <div className="sm:hidden font-medium mb-1">
                                  {booking.name}
                                </div>
                                <div className="sm:hidden">
                                  {booking.phoneNumber}
                                </div>
                                <div className="md:hidden">
                                  Court {booking.courtNumber}
                                </div>
                                <div className="md:hidden">
                                  {formatDate(booking.date)}
                                </div>
                                <div className="sm:hidden">
                                  {booking.startTime} - {booking.endTime}
                                </div>
                                <div className="lg:hidden sm:hidden">
                                  Players: {booking.numberOfPlayers}
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                Court {booking.courtNumber}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {formatDate(booking.date)}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {booking.startTime} - {booking.endTime}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {booking.numberOfPlayers}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    booking.status === "confirmed"
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell max-w-[200px] truncate">
                                {booking.notes || "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2 px-4">
                    <CardTitle>Bookings by Court</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3">
                    {Object.keys(bookingsByCourt).length === 0 ? (
                      <div className="text-center py-6">No data available</div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(bookingsByCourt).map(
                          ([court, count]: [string, number]) => (
                            <div key={court}>
                              <div className="flex justify-between mb-1">
                                <span>{court}</span>
                                <span className="font-medium">{count}</span>
                              </div>
                              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{
                                    width: `${(count / totalBookings) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 px-4">
                    <CardTitle>Booking Status</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Confirmed</span>
                          <span className="font-medium">
                            {confirmedBookings}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: `${
                                (confirmedBookings / totalBookings) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Cancelled</span>
                          <span className="font-medium">
                            {cancelledBookings}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{
                              width: `${
                                (cancelledBookings / totalBookings) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
};

export default Admin;
