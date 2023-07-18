const rateLimit = require("express-rate-limit");

// Midleware di sicurezza essenziale per contenere attacchi di tipo DDOS
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,
  message: "Too many requests, please try again later.",
});

module.exports = limiter;
