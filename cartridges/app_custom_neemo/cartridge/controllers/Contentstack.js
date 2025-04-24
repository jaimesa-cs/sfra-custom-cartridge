var server = require("server");
var Logger = require("dw/system/Logger");
var cms = require("*/cartridge/scripts/services/contentstack");

server.get("JSON", function (req, res, next) {
  Logger.info("🚀 Contenstack JSON controller");
  var requestData = {};
  var queryParams = req.querystring;

  // Iterate over querystring parameters
  for (var key in queryParams) {
    if (key === "queryString") {
      continue;
    }
    if (queryParams.hasOwnProperty(key)) {
      requestData[key] = queryParams[key];
    }
  }
  requestData = cms.appendBaseRequestData(requestData);

  if (requestData.showRequestData === "true") {
    res.json(requestData);
  } else {
    res.json(cms.getCmsData(requestData));
  }
  return next();
});

module.exports = server.exports();
