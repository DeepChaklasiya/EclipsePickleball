// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // For development, allow all origins
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://eclipsepickleball.com",
    ];
    const isAllowed = !origin || allowedOrigins.indexOf(origin) !== -1;
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

module.exports = corsOptions;
