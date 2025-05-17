import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  User,
  Calendar,
  XCircle,
  Menu,
  Search,
  X,
  Filter,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://eclipse-backend-4pp3.onrender.com/api";

const Admin = () => {
  const navigate = useNavigate();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(true);

  // Admin data
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");

  // Filter state
  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [courtFilter, setCourtFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Delete booking state
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if admin is already authenticated
  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
      setShowAuthDialog(false);
      fetchBookings();
    }
  }, []);

  // Apply filters to bookings
  useEffect(() => {
    if (bookings.length > 0) {
      let results = [...bookings];

      // Apply name filter
      if (nameFilter) {
        results = results.filter((booking) =>
          booking.name.toLowerCase().includes(nameFilter.toLowerCase())
        );
      }

      // Apply phone filter
      if (phoneFilter) {
        results = results.filter((booking) =>
          booking.phoneNumber.includes(phoneFilter)
        );
      }

      // Apply date filter
      if (dateFilter) {
        results = results.filter((booking) => {
          const bookingDate = new Date(booking.date).toLocaleDateString();
          return bookingDate.includes(dateFilter);
        });
      }

      // Apply court filter
      if (courtFilter && courtFilter !== "all") {
        results = results.filter(
          (booking) => booking.courtNumber.toString() === courtFilter
        );
      }

      // Apply status filter
      if (statusFilter && statusFilter !== "all") {
        results = results.filter((booking) => booking.status === statusFilter);
      }

      setFilteredBookings(results);
    } else {
      setFilteredBookings([]);
    }
  }, [
    bookings,
    nameFilter,
    phoneFilter,
    dateFilter,
    courtFilter,
    statusFilter,
  ]);

  // Fetch bookings data
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/bookings`);

      if (response.data.status === "success") {
        setBookings(response.data.data.bookings);
        setFilteredBookings(response.data.data.bookings);
      } else {
        toast.error("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Error fetching bookings data");
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setNameFilter("");
    setPhoneFilter("");
    setDateFilter("");
    setCourtFilter("");
    setStatusFilter("");
  };

  // Handle admin authentication
  const handleAuthenticate = async () => {
    if (!password) {
      toast.error("Please enter the admin password");
      return;
    }

    try {
      setIsAuthenticating(true);
      const response = await axios.post(`${API_URL}/auth/verify-admin`, {
        password,
      });

      if (response.data.status === "success") {
        setIsAuthenticated(true);
        localStorage.setItem("adminAuth", "true");
        setShowAuthDialog(false);
        fetchBookings();
        toast.success("Admin authentication successful");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Invalid admin password");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuth");
    navigate("/");
    toast.success("Logged out from admin panel");
  };

  // Handle booking deletion
  const confirmDeleteBooking = (booking) => {
    setBookingToDelete(booking);
    setShowDeleteDialog(true);
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;

    try {
      setIsDeleting(true);
      await axios.delete(`${API_URL}/bookings/${bookingToDelete._id}`);

      // Refetch bookings after deletion
      await fetchBookings();

      toast.success("Booking deleted successfully");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking");
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-6 px-3 sm:px-4 md:px-6 max-w-6xl bg-slate-950">
      {/* Admin Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md bg-slate-900 border border-blue-600">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-white">
              <Shield className="h-5 w-5 text-blue-400" />
              Admin Authentication
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Please enter the admin password to access the dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAuthenticate();
                }
              }}
              className="bg-slate-800 text-white border-slate-600 focus:border-blue-500"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleAuthenticate}
              disabled={isAuthenticating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isAuthenticating ? "Verifying..." : "Login"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Dashboard */}
      {isAuthenticated && (
        <>
          <header className="mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                Admin Dashboard
              </h1>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-blue-500 text-black-100 hover:bg-blue-900/50"
              >
                Logout
              </Button>
            </div>
            <Separator className="my-4 bg-blue-800/40" />
          </header>

          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6 w-full bg-slate-800 border border-blue-900">
              <TabsTrigger
                value="bookings"
                className="flex-1 data-[state=active]:bg-blue-700 data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Bookings
              </TabsTrigger>
              <TabsTrigger
                value="statistics"
                className="flex-1 data-[state=active]:bg-blue-700 data-[state=active]:text-white"
              >
                <User className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card className="bg-slate-900 border-blue-900 mb-6">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg sm:text-xl text-white">
                      Filters
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="border-blue-500 text-black-100 md:hidden"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {showFilters ? "Hide Filters" : "Show Filters"}
                      </Button>
                      {(nameFilter ||
                        phoneFilter ||
                        dateFilter ||
                        courtFilter ||
                        statusFilter) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent
                  className={`${showFilters ? "block" : "hidden"} md:block`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Name Filter */}
                    <div>
                      <Label className="text-slate-300 text-sm mb-1 block">
                        Name
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Filter by name"
                          value={nameFilter}
                          onChange={(e) => setNameFilter(e.target.value)}
                          className="pl-8 bg-slate-800 text-white border-slate-600 focus:border-blue-500"
                        />
                        {nameFilter && (
                          <X
                            className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 cursor-pointer hover:text-white"
                            onClick={() => setNameFilter("")}
                          />
                        )}
                      </div>
                    </div>

                    {/* Phone Filter */}
                    <div>
                      <Label className="text-slate-300 text-sm mb-1 block">
                        Phone
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Filter by phone"
                          value={phoneFilter}
                          onChange={(e) => setPhoneFilter(e.target.value)}
                          className="pl-8 bg-slate-800 text-white border-slate-600 focus:border-blue-500"
                        />
                        {phoneFilter && (
                          <X
                            className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 cursor-pointer hover:text-white"
                            onClick={() => setPhoneFilter("")}
                          />
                        )}
                      </div>
                    </div>

                    {/* Date Filter */}
                    <div>
                      <Label className="text-slate-300 text-sm mb-1 block">
                        Date
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="MM/DD/YYYY"
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="pl-8 bg-slate-800 text-white border-slate-600 focus:border-blue-500"
                        />
                        {dateFilter && (
                          <X
                            className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 cursor-pointer hover:text-white"
                            onClick={() => setDateFilter("")}
                          />
                        )}
                      </div>
                    </div>

                    {/* Court Filter */}
                    <div>
                      <Label className="text-slate-300 text-sm mb-1 block">
                        Court
                      </Label>
                      <Select
                        value={courtFilter}
                        onValueChange={setCourtFilter}
                      >
                        <SelectTrigger className="bg-slate-800 text-white border-slate-600">
                          <SelectValue placeholder="All courts" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="all">All courts</SelectItem>
                          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              Court {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <Label className="text-slate-300 text-sm mb-1 block">
                        Status
                      </Label>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="bg-slate-800 text-white border-slate-600">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Active filters */}
                  {(nameFilter ||
                    phoneFilter ||
                    dateFilter ||
                    courtFilter ||
                    statusFilter) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {nameFilter && (
                        <Badge
                          variant="outline"
                          className="bg-blue-900/30 text-blue-100 border-blue-700 py-1"
                        >
                          Name: {nameFilter}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => setNameFilter("")}
                          />
                        </Badge>
                      )}
                      {phoneFilter && (
                        <Badge
                          variant="outline"
                          className="bg-blue-900/30 text-blue-100 border-blue-700 py-1"
                        >
                          Phone: {phoneFilter}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => setPhoneFilter("")}
                          />
                        </Badge>
                      )}
                      {dateFilter && (
                        <Badge
                          variant="outline"
                          className="bg-blue-900/30 text-blue-100 border-blue-700 py-1"
                        >
                          Date: {dateFilter}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => setDateFilter("")}
                          />
                        </Badge>
                      )}
                      {courtFilter && (
                        <Badge
                          variant="outline"
                          className="bg-blue-900/30 text-blue-100 border-blue-700 py-1"
                        >
                          Court: {courtFilter}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => setCourtFilter("all")}
                          />
                        </Badge>
                      )}
                      {statusFilter && (
                        <Badge
                          variant="outline"
                          className="bg-blue-900/30 text-blue-100 border-blue-700 py-1"
                        >
                          Status: {statusFilter}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => setStatusFilter("all")}
                          />
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-blue-900">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg sm:text-xl text-white">
                      All Bookings
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-blue-900/40 text-blue-100 border-blue-700 py-1.5 px-2.5"
                    >
                      {filteredBookings.length}{" "}
                      {filteredBookings.length === 1 ? "booking" : "bookings"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-slate-300">
                      Loading bookings...
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-8 text-slate-300">
                      {bookings.length === 0
                        ? "No bookings found"
                        : "No bookings match your filters"}
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      {/* Mobile view - cards layout */}
                      <div className="md:hidden space-y-4 px-4">
                        {filteredBookings.map((booking) => (
                          <div
                            key={booking._id}
                            className="p-4 bg-slate-800 rounded-lg border border-blue-900/50"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-white">
                                {booking.name}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  booking.status === "confirmed"
                                    ? "bg-green-700 text-green-100"
                                    : "bg-red-700 text-red-100"
                                }`}
                              >
                                {booking.status}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-slate-300 mb-3">
                              <p>
                                📱{" "}
                                <span className="text-white">
                                  {booking.phoneNumber}
                                </span>
                              </p>
                              <p>
                                🗓️{" "}
                                <span className="text-white">
                                  {formatDate(booking.date)}
                                </span>
                              </p>
                              <p>
                                🎾{" "}
                                <span className="text-white">
                                  Court {booking.courtNumber}
                                </span>
                              </p>
                              <p>
                                ⏰{" "}
                                <span className="text-white">
                                  {booking.isEclipseSlot
                                    ? "Midnight Session"
                                    : booking.startTime}
                                </span>
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40"
                              onClick={() => confirmDeleteBooking(booking)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Desktop view - table layout */}
                      <div className="hidden md:block">
                        <Table className="border-collapse">
                          <TableHeader>
                            <TableRow className="border-blue-800/40 hover:bg-slate-800">
                              <TableHead className="text-blue-100 font-semibold">
                                Name
                              </TableHead>
                              <TableHead className="text-blue-100 font-semibold">
                                Phone
                              </TableHead>
                              <TableHead className="text-blue-100 font-semibold">
                                Date
                              </TableHead>
                              <TableHead className="text-blue-100 font-semibold">
                                Court
                              </TableHead>
                              <TableHead className="text-blue-100 font-semibold">
                                Time
                              </TableHead>
                              <TableHead className="text-blue-100 font-semibold">
                                Status
                              </TableHead>
                              <TableHead className="text-blue-100 font-semibold">
                                Action
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredBookings.map((booking) => (
                              <TableRow
                                key={booking._id}
                                className="border-blue-800/40 hover:bg-slate-800"
                              >
                                <TableCell className="text-white font-medium">
                                  {booking.name}
                                </TableCell>
                                <TableCell className="text-white">
                                  {booking.phoneNumber}
                                </TableCell>
                                <TableCell className="text-white">
                                  {formatDate(booking.date)}
                                </TableCell>
                                <TableCell className="text-white">
                                  Court {booking.courtNumber}
                                </TableCell>
                                <TableCell className="text-white">
                                  {booking.isEclipseSlot
                                    ? "Midnight Session"
                                    : booking.startTime}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      booking.status === "confirmed"
                                        ? "bg-green-700 text-green-100"
                                        : "bg-red-700 text-red-100"
                                    }`}
                                  >
                                    {booking.status}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40"
                                    onClick={() =>
                                      confirmDeleteBooking(booking)
                                    }
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-slate-900 border-blue-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg text-white">
                      Total Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-300">
                      {bookings.length}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-blue-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg text-white">
                      Active Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl sm:text-3xl font-bold text-green-400">
                      {bookings.filter((b) => b.status === "confirmed").length}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-blue-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg text-white">
                      Cancelled Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl sm:text-3xl font-bold text-red-400">
                      {bookings.filter((b) => b.status === "cancelled").length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Delete Booking Confirmation Dialog */}
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent className="bg-slate-900 border border-blue-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Confirm Deletion
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-300">
                  Are you sure you want to delete this booking?
                  <br />
                  {bookingToDelete && (
                    <span className="text-blue-300 font-medium block mt-2">
                      {bookingToDelete.name}'s booking for Court{" "}
                      {bookingToDelete.courtNumber} on{" "}
                      {formatDate(bookingToDelete.date)}
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-blue-800 text-black-100 hover:bg-blue-950">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteBooking}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};

export default Admin;
