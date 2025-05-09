# Changelog

## [1.1.0] - 2023-05-08

### Removed

- Removed Twilio dependency for SMS OTP delivery
- Removed Twilio-related environment variables (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
- Removed Twilio configuration file (src/config/twilio.js)

### Changed

- Modified OTP handling to log codes to the console in development mode instead of sending via SMS
- Updated README with instructions for testing OTP in development mode
- Simplified environment variables in .env file

### Added

- Added clear console output formatting for OTP codes during development
- Added documentation on how to implement a proper SMS service in production
