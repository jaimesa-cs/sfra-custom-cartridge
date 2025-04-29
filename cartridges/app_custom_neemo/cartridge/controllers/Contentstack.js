/**
 * Contentstack Controller
 *
 * This controller provides an endpoint to interact with Contentstack's API.
 * It processes incoming requests, appends base request data, and retrieves
 * content from Contentstack based on the provided query parameters.
 */

var server = require("server");
var Logger = require("dw/system/Logger");
var cms = require("*/cartridge/scripts/services/contentstack");

/**
 * JSON Endpoint
 *
 * Route: GET /Contentstack-JSON
 *
 * Purpose:
 * - Logs the request for debugging purposes.
 * - Processes query parameters from the request.
 * - Appends base request data required for Contentstack API calls.
 * - Returns either the request data (for debugging) or the CMS data retrieved from Contentstack.
 *
 * Query Parameters:
 * - `showRequestData`: If set to "true", the endpoint returns the constructed request data instead of the CMS data.
 * - Other query parameters are passed to the Contentstack service for data retrieval.
 */
server.get("JSON", function (req, res, next) {
  Logger.info("🚀 Contentstack JSON controller");

  // Initialize request data object
  var requestData = {};
  var queryParams = req.querystring;

  // Iterate over querystring parameters and add them to the request data
  for (var key in queryParams) {
    if (key === "queryString") {
      continue; // Skip the "queryString" parameter
    }
    if (queryParams.hasOwnProperty(key)) {
      requestData[key] = queryParams[key];
    }
  }

  // Append base request data required for Contentstack API calls
  requestData = cms.appendBaseRequestData(requestData);

  // If "showRequestData" is true, return the constructed request data for debugging
  if (requestData.showRequestData === "true") {
    res.json(requestData);
  } else {
    // Otherwise, fetch and return CMS data from Contentstack
    res.json(cms.getCmsData(requestData));
  }

  return next();
});

// Export the server module
module.exports = server.exports();
