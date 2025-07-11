"use strict";

var server = require("server");

/**
 * Returns dummy product JSON + CORS headers
 */
server.get("Show", function (req, res, next) {
  var origin = request.getHttpHeaders().origin;
  var allowedOrigins = [
    "http://localhost:3005",
    "https://app.contentstack.com",
  ];

  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHttpHeader("Access-Control-Allow-Origin", origin);
    res.setHttpHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHttpHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHttpHeader("Access-Control-Allow-Credentials", "true");
    res.setHttpHeader("Vary", "Origin");
  }

  res.json({
    name: "Test Product",
    id: "test123",
    price: 19.99,
  });

  return next();
});

module.exports = server.exports();
