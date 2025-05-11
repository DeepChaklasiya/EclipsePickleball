import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { setUser } from "@/lib/auth";
import { OTP_CLIENT_ID } from "@/lib/env";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    phoneEmailListener?: (data: { user_json_url: string }) => void;
  }
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPhoneEmailButton, setShowPhoneEmailButton] = useState(false);
  const signInButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Setup Phone.Email callback function
    window.phoneEmailListener = (data) => {
      if (data && data.user_json_url) {
        // Fetch user data from JSON URL
        fetch(data.user_json_url)
          .then((response) => response.json())
          .then((userData) => {
            toast.success("Phone verification successful!", {
              position: "top-center",
              duration: 3000,
              className: "mt-16" // Add margin to push toast down below navbar
            });

            // Store user data using our auth utility
            setUser({
              phoneNumber: userData.user_phone_number,
              countryCode: userData.user_country_code,
              name: name || userData.user_first_name || "User",
            });

            // Close modal and navigate
            setLoading(false);
            onClose();
            navigate("/location-select");
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
            toast.error("Verification failed. Please try again.");
            setLoading(false);
          });
      }
    };

    // Load Phone.Email script when button becomes visible
    if (isOpen && showPhoneEmailButton && signInButtonRef.current) {
      const script = document.createElement("script");
      script.src = "https://www.phone.email/sign_in_button_v1.js";
      script.async = true;

      if (!document.getElementById("phoneemail-script")) {
        script.id = "phoneemail-script";
        signInButtonRef.current.appendChild(script);
      }
    }

    return () => {
      // Cleanup script when modal closes
      if (!isOpen) {
        const script = document.getElementById("phoneemail-script");
        if (script) {
          script.remove();
        }
      }
    };
  }, [isOpen, navigate, onClose, name, showPhoneEmailButton]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setLoading(true);
    // Show the Phone.Email button which will load the script
    setShowPhoneEmailButton(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl bg-gradient-to-r from-pink-400 to-amber-300 bg-clip-text text-transparent">
            Sign In
          </DialogTitle>
        </DialogHeader>

        {!showPhoneEmailButton ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-amber-400 hover:from-pink-600 hover:to-amber-500"
              disabled={loading}
            >
              {loading ? "Processing..." : "Get OTP"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground mb-4">
              <p>Verify your phone number with OTP</p>
            </div>

            {/* Phone.Email button container */}
            <div
              ref={signInButtonRef}
              className="pe_signin_button flex justify-center"
              data-client-id={OTP_CLIENT_ID}
            ></div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPhoneEmailButton(false);
                setLoading(false);
              }}
              className="w-full mt-4"
            >
              Back
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
