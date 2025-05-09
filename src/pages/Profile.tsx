import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, History, LogOut } from "lucide-react";
import { getUser, logout } from "@/lib/auth";
import { toast } from "sonner";

interface UserData {
  name: string;
  phoneNumber: string;
  countryCode: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const user = getUser();
    if (!user) {
      // If no user is logged in, redirect to home page
      navigate("/");
      return;
    }
    setUserData(user);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    toast.success("You have been signed out");
    navigate("/");
  };

  if (!userData) {
    return null; // Don't render anything while checking auth
  }

  return (
    <div className="page-container bg-eclipse-dark text-white min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-pink-300 to-amber-200 bg-clip-text text-transparent">
          Your Profile
        </h1>

        <div className="bg-gray-800/50 rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Avatar */}
            <div className="w-24 h-24 bg-gradient-to-r from-pink-400 to-amber-300 rounded-full flex items-center justify-center">
              <User size={40} className="text-black" />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-semibold">{userData.name}</h2>
              <p className="text-gray-400">
                {userData.countryCode} {userData.phoneNumber}
              </p>
              <p className="mt-2 text-sm bg-gradient-to-r from-pink-300 to-amber-200 bg-clip-text text-transparent font-medium">
                Eclipse Player
              </p>
            </div>
          </div>
        </div>

        {/* Profile Sections - Only Booking History and Logout */}
        <div className="grid md:grid-cols-2 gap-4">
          <div
            className="bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/50 transition-all cursor-pointer"
            onClick={() => navigate("/booking-history")} // You would need to create this page
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <History size={20} className="text-blue-400" />
              </div>
              <h3 className="font-semibold">Booking History</h3>
            </div>
            <p className="text-sm text-gray-400">
              View your past and upcoming bookings
            </p>
          </div>

          <div
            className="bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/50 transition-all cursor-pointer"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <LogOut size={20} className="text-red-400" />
              </div>
              <h3 className="font-semibold">Logout</h3>
            </div>
            <p className="text-sm text-gray-400">Sign out from your account</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={() => navigate("/")} variant="cosmic" size="sm">
            <span>BACK TO HOME</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
