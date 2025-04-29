var server = require("server");
var Logger = require("dw/system/Logger");

server.get("Send", function (req, res, next) {
  res.json({
    event: "hello",
    value: "world",
  });
  return next();
});

module.exports = server.exports();
