import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="content-with-sticky-button text-center">
      <img
        src="/lovable-uploads/5bbf4ffd-5c67-4c94-97cd-2b7b4be77de8.png"
        alt="Eclipse Pickleball Logo"
        className="w-32 h-auto mb-8"
      />
      
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-xl mb-8 text-muted-foreground">Oops! Page not found</p>
      </div>
      
      <div className="sticky-button-container w-full max-w-xs mx-auto">
        <Button 
          onClick={() => navigate("/")} 
          variant="cosmic"
          size="cosmic"
          className="w-full"
        >
          <span>RETURN HOME</span>
      </Button>
      </div>
    </div>
  );
};

export default NotFound;
