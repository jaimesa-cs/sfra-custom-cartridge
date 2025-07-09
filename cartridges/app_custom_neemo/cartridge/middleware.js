"use strict";

var server = require("server");
var Logger = require("dw/system/Logger");

server.use((req, res, next) => {
  Logger.getLogger("neemo", "neemo").info(
    "✅ Custom server.js middleware triggered: " + req.requestURI
  );
  next();
});

module.exports = server.exports();
