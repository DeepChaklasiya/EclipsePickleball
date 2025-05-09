import { useEffect } from "react";

/**
 * Custom hook to prevent page refresh and show a confirmation dialog
 * This helps prevent data loss when users accidentally refresh the page
 */
const usePreventRefresh = () => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Cancel the event
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = "";

      // Custom message (note: most modern browsers will show their own generic message instead)
      return "Are you sure you want to leave? Your booking progress will be lost.";
    };

    // Add event listener when the component mounts
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Remove event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
};

export default usePreventRefresh;
