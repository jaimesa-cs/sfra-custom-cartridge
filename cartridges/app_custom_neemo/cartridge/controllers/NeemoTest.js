var server = require("server");
var Logger = require("dw/system/Logger");

server.get("Show", function (req, res, next) {
  Logger.info("🚀 Neemo cartridge is LIVE!");
  res.render("neemo/hello");
  return next();
});

module.exports = server.exports();
