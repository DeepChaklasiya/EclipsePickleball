// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// In a real production environment, this would send an SMS via a service provider
// For development, we'll just log it to the console
const sendOTP = async (phoneNumber, otp) => {
  try {
    // Log OTP to console for testing purposes
    console.log("\n");
    console.log(
      "=============================================================="
    );
    console.log("🔐 DEVELOPMENT MODE: OTP VERIFICATION CODE");
    console.log(
      "--------------------------------------------------------------"
    );
    console.log(`📱 Phone: ${phoneNumber}`);
    console.log(`🔑 OTP:   ${otp}`);
    console.log(
      "--------------------------------------------------------------"
    );
    console.log(
      "❗ In production, integrate a real SMS service for OTP delivery"
    );
    console.log(
      "=============================================================="
    );
    console.log("\n");

    return {
      success: true,
      message: "OTP sent successfully (check server console)",
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

module.exports = {
  generateOTP,
  sendOTP,
};
