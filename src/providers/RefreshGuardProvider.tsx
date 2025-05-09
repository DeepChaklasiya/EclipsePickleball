import React, { ReactNode } from "react";
import usePreventRefresh from "@/hooks/usePreventRefresh";

interface RefreshGuardProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the application and prevents page refresh
 */
const RefreshGuardProvider: React.FC<RefreshGuardProviderProps> = ({
  children,
}) => {
  // Apply the prevent refresh hook
  usePreventRefresh();

  return <>{children}</>;
};

export default RefreshGuardProvider;
