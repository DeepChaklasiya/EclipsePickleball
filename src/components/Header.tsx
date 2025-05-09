import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
}

// This component is now effectively disabled and won't render anything
const Header = ({ title, showBackButton = false }: HeaderProps) => {
  // Return null to not render anything
  return null;
};

export default Header;
