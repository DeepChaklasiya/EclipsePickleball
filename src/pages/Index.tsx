import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import { isAuthenticated } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [starCount] = useState(50);
  const [stars, setStars] = useState<
    Array<{
      id: number;
      size: number;
      top: string;
      left: string;
      delay: number;
      duration: number;
    }>
  >([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  // Generate stars with random positions for the cosmic background
  useEffect(() => {
    const newStars = Array.from({ length: starCount }, (_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 3,
      duration: Math.random() * 3 + 2,
    }));
    setStars(newStars);
  }, [starCount]);

  const handleBookCourtClick = () => {
    if (isAuthenticated()) {
      // User is already authenticated, redirect to location selection
      navigate("/location-select");
    } else {
      // User is not authenticated, open auth modal
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0e1538] to-black z-0"></div>

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white z-0 animate-pulse"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: star.top,
            left: star.left,
            opacity: Math.random() * 0.7 + 0.3,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      {/* Nebula-like Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl transform -translate-x-1/2 -translate-y-1/2 z-0"></div>
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 blur-3xl z-0"></div>
      <div className="absolute top-2/3 right-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-green-500/10 to-teal-500/10 blur-3xl z-0"></div>

      {/* Glow Lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent z-0"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent z-0"></div>
      <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent z-0"></div>
      <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-transparent via-green-500/30 to-transparent z-0"></div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center text-center p-4 relative z-10 content-with-sticky-button">
        <div className="w-full max-w-md animate-fade-in backdrop-blur-sm bg-black/20 rounded-lg p-8 border border-white/10 shadow-[0_0_25px_rgba(0,200,255,0.2)]">
          <img
            src="/lovable-uploads/5bbf4ffd-5c67-4c94-97cd-2b7b4be77de8.png"
            alt="Eclipse Pickleball Logo"
            className="w-48 h-auto mx-auto mb-8 drop-shadow-[0_0_8px_rgba(255,165,0,0.6)]"
          />

          <h1 className="text-2xl sm:text-3xl font-light tracking-wider mb-4 text-white">
            <span className="bg-gradient-to-r from-pink-400 to-amber-300 bg-clip-text text-transparent">
              Serving under the shadow—pickleball eclipse style
            </span>{" "}
            {/* <span className="font-light tracking-wider">PICKLEBALL</span> */}
          </h1>

          <p className="text-lg mb-8 text-blue-100/80 font-light tracking-wide">
            Play under the stars
          </p>

          {/* <div className="mt-16">
            <p className="text-sm text-blue-100/60 font-light">
              Join the cosmic pickleball experience
            </p>
          </div> */}
        </div>
      </div>

      <div className="sticky-button-container w-full max-w-xs mx-auto">
        <Button
          onClick={handleBookCourtClick}
          variant="cosmic"
          size="cosmic"
          className="w-full"
        >
          <span>BOOK A COURT</span>
        </Button>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default Index;
