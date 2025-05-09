// Environment variables safely exposed for client-side use
export const API_URL =
  import.meta.env.VITE_API ||
  "https://eclipse-backend-i8qm.onrender.com:5000/api";
export const OTP_CLIENT_ID = import.meta.env.VITE_OTP || "11342325218017613728";
