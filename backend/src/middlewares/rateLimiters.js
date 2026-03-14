const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 failed login attempts per windowMs
  message: {
    message: 'Too many failed login attempts, please try again after 10 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // skipSuccessfulRequests: true, // Count all requests to ensure req.rateLimit is available
});

module.exports = {
  loginLimiter
};
