import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define window properties for Typescript
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
    confirmationResult: ConfirmationResult | null;
  }
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);

  // Setup invisible reCAPTCHA when modal opens
  useEffect(() => {
    if (isOpen && !window.recaptchaVerifier) {
      setupRecaptcha();
    }

    // Cleanup when modal closes
    return () => {
      if (!isOpen && window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [isOpen]);

  // Setup invisible reCAPTCHA
  const setupRecaptcha = () => {
    try {
      // Clear any existing recaptcha
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, "send-otp-btn", {
        size: "invisible",
        isV3: true,
        forceInvisible: true,
        callback: () => {
          console.log("reCAPTCHA solved automatically");
        },
        "expired-callback": () => {
          toast({
            title: "reCAPTCHA expired",
            description: "Please try again",
            variant: "destructive",
          });
        },
      });
    } catch (error: any) {
      console.error("Error setting up reCAPTCHA:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to setup verification",
        variant: "destructive",
      });
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Make sure we have a recaptcha verifier
      if (!window.recaptchaVerifier) {
        setupRecaptcha();
      }

      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier!;

      // Send verification code
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      // Store confirmation result
      window.confirmationResult = confirmationResult;

      // Update UI
      setIsVerifying(true);

      toast({
        title: "OTP Sent",
        description: "A verification code has been sent to your phone",
      });
    } catch (error: any) {
      console.error("Error sending verification code:", error);

      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });

      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
        setupRecaptcha();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length < 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid verification code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (!window.confirmationResult) {
        throw new Error("No verification was sent. Please request a new code.");
      }

      // Verify the code
      const result = await window.confirmationResult.confirm(otp);

      // User is now signed in
      console.log("User signed in:", result.user);

      toast({
        title: "Login Successful",
        description: "Welcome to Eclipse Pickleball",
      });

      // Reset state and close modal
      window.confirmationResult = null;
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      onClose();
      navigate("/location-select");
    } catch (error: any) {
      console.error("Error verifying code:", error);

      toast({
        title: "Error",
        description: error.message || "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setIsVerifying(false);
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
      setupRecaptcha();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl eclipse-gradient">
            {isVerifying ? "Verify Phone" : "Sign In / Sign Up"}
          </DialogTitle>
        </DialogHeader>

        {!isVerifying ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Phone Number
              </label>
              <Input
                placeholder="Enter your phone number (e.g. +11234567890)"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-secondary/30"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Include country code (e.g. +1 for US)
            </p>
            <Button
              id="send-otp-btn"
              type="submit"
              className="w-full booking-button bg-eclipse-gradient"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Verification Code
              </label>
              <Input
                placeholder="Enter OTP"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="bg-secondary/30"
                maxLength={6}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              We sent a code to {phoneNumber}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full booking-button bg-eclipse-gradient"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleChangeNumber}
                className="text-sm text-muted-foreground hover:text-foreground"
                disabled={loading}
              >
                Change Phone Number
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
