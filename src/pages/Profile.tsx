import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, History, CreditCard, MessageSquare, LogOut } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();

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
              <h2 className="text-2xl font-semibold">Eclipse Member</h2>
              <p className="text-gray-400">member@eclipse.com</p>
              <p className="mt-2 text-sm bg-gradient-to-r from-pink-300 to-amber-200 bg-clip-text text-transparent font-medium">
                Premium Membership Active
              </p>
            </div>

            {/* Edit Profile Button */}
            {/* <Button 
              variant="outline" 
              size="sm" 
              className="border-pink-400/40 text-white hover:bg-pink-500/10"
            >
              Edit Profile
            </Button> */}
          </div>
        </div>

        {/* Profile Sections */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/50 transition-all">
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

          <div className="bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/50 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <CreditCard size={20} className="text-amber-400" />
              </div>
              <h3 className="font-semibold">Membership</h3>
            </div>
            <p className="text-sm text-gray-400">
              Manage your membership plan and payments
            </p>
          </div>

          <div className="bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/50 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <MessageSquare size={20} className="text-green-400" />
              </div>
              <h3 className="font-semibold">Feedback</h3>
            </div>
            <p className="text-sm text-gray-400">
              Share your experience and suggestions
            </p>
          </div>

          <div className="bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/50 transition-all">
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
