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
  const [animateButton, setAnimateButton] = useState(false);
  const [animateCoupon, setAnimateCoupon] = useState(false);
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

  // Add button animation after a short delay when the page loads
  useEffect(() => {
    // Short delay before starting the animation
    const timer = setTimeout(() => {
      setAnimateButton(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Add coupon animation for first-time visitors
  useEffect(() => {
    // Check if this is the first visit
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    
    if (!hasVisitedBefore) {
      // Set timeout to animate coupon box after page loads
      const couponTimer = setTimeout(() => {
        setAnimateCoupon(true);
        
        // After animation completes, mark as visited
        setTimeout(() => {
          localStorage.setItem('hasVisitedBefore', 'true');
        }, 2000);
      }, 1500);
      
      return () => clearTimeout(couponTimer);
    }
  }, []);

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

      {/* Coupon Banner - Moved to top position */}
      <div className="w-full max-w-md mx-auto mt-20 mb-4 relative z-20">
        <div 
          className={`bg-gradient-to-r from-indigo-600/40 to-purple-600/40 backdrop-blur-md rounded-lg p-4 border border-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.5)] relative overflow-hidden transition-all duration-700 ease-in-out ${
            animateCoupon ? 'animate-bounce scale-105' : 'animate-pulse-slow'
          }`}
        >
          {/* Starburst effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-full scale-150 blur-xl"></div>
          
          {/* Sparkle effects */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full opacity-70 animate-pulse"></div>
          <div className="absolute top-1/2 -right-1 w-2 h-2 bg-white rounded-full opacity-60 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
          <div className="absolute -bottom-1 left-1/3 w-2 h-2 bg-white rounded-full opacity-50 animate-pulse" style={{ animationDelay: "1s" }}></div>
          
          {/* Diagonal light streak */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute -top-1 -left-1 w-[120%] h-[5px] bg-gradient-to-r from-transparent via-white/40 to-transparent transform rotate-45 translate-y-[400%] animate-pulse" style={{ animationDuration: "3s" }}></div>
          </div>
          
          <div className="text-center relative z-10">
            <p className="text-white text-sm font-medium tracking-wide">
              Use coupon code:
            </p>
            <div className="my-1 py-1 px-2 bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 rounded-md border border-white/20 inline-block shadow-[0_0_10px_rgba(99,102,241,0.4)]">
              <span className="font-bold text-transparent bg-gradient-to-r from-indigo-300 to-fuchsia-300 bg-clip-text tracking-wider text-base">WELCOME100</span>
            </div>
            <p className="text-white/90 text-xs mt-1 tracking-wide">to get <span className="font-semibold text-indigo-200">₹100 off</span> your first booking!</p>
          </div>
        </div>
      </div>

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
              Pickleball just went Interstellar!!
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
        <div className={`relative ${animateButton ? 'animate-ring-outer' : ''}`}>
          {/* Outer glow ring */}
          {animateButton && (
            <div className="absolute inset-0 rounded-xl animate-ping-slow bg-gradient-to-r from-pink-400 to-amber-300 opacity-50"></div>
          )}
          <Button
            onClick={handleBookCourtClick}
            variant="cosmic"
            size="cosmic"
            className="w-full font-semibold relative group"
          >
            <span className="flex items-center justify-center">
              BOOK A COURT 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Button>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default Index;
