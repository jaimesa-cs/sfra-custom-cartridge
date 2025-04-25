"use strict";

var LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");
var Site = require("dw/system/Site");
var Locale = require("dw/util/Locale");

const appendBaseRequestData = function (appendRequestData) {
  var sitePrefs = Site.getCurrent();
  var currentLocale = Locale.getLocale(request.locale); // returns Locale object
  var language = currentLocale.language; // e.g., "en"
  var country = currentLocale.country;
  var locale =
    currentLocale && currentLocale.language && currentLocale.country
      ? (language + "-" + country).toLowerCase()
      : "en-us";

  var requestData = {
    endpoint: sitePrefs.getCustomPreferenceValue("cmsApiEndpoint"),
    preview_endpoint: sitePrefs.getCustomPreferenceValue("cmsPreviewEndpoint"),
    access_token: sitePrefs.getCustomPreferenceValue("cmsAccessToken"),
    api_key: sitePrefs.getCustomPreferenceValue("cmsApiKey"),
    environment: sitePrefs.getCustomPreferenceValue("cmsEnvironment"),
    branch: sitePrefs.getCustomPreferenceValue("cmdBranch"), //There's a typo in Business Manager, it should be "cmsBranch"
    preview_token: sitePrefs.getCustomPreferenceValue("cmsPreviewToken"),
    locale: locale || "en-us", // Default to "en-us" if locale is not found
  };
  if (appendRequestData) {
    Object.assign(appendRequestData, requestData);
  }
  return appendRequestData;
};

const getContentstackService = function (requestData) {
  var contentstackService = LocalServiceRegistry.createService(
    "Contentstack.Content.Service",
    {
      createRequest: function (svc, requestData) {
        var host = requestData.endpoint;
        if (requestData && requestData.live_preview) {
          host = requestData.preview_endpoint;
          svc.addHeader("preview_token", requestData.preview_token);
          svc.addHeader("live_preview", requestData.live_preview);
          svc.addHeader("content_type", requestData.content_type_uid);
          if (requestData.preview_timestamp) {
            svc.addHeader(
              "preview_timestamp",
              decodeURIComponent(requestData.preview_timestamp)
            );
          }
        } else {
          svc.addHeader("access_token", requestData.access_token);
        }

        let query = "";
        if (requestData.query) {
          const decodedQuery = decodeURIComponent(requestData.query);
          query = encodeURIComponent(decodedQuery);
        }
        host = `${host}/v3/content_types/${requestData.content_type_uid}/entries?environment=${requestData.environment}&locale=${requestData.locale}&query=${query}`;

        svc.setURL(host);
        svc.setRequestMethod("GET");
        svc.addHeader("Content-Type", "application/json");
        svc.addHeader("api_key", requestData.api_key);

        svc.addHeader("Accept", "application/json");
        return null;
      },
      parseResponse: function (svc, httpClient) {
        var result = {};

        try {
          result = JSON.parse(httpClient.text);
        } catch (e) {
          result = httpClient.text;
        }
        return result;
      },
      getRequestLogMessage: function (requestData) {
        return JSON.stringify(requestData);
      },

      getResponseLogMessage: function (response) {
        return response.text;
      },
    }
  );
  return contentstackService;
};
module.exports = {
  getCmsData: function (requestData) {
    const cmsRequestData = appendBaseRequestData(requestData);
    const contentstackService = getContentstackService(cmsRequestData);
    var result = contentstackService.call(cmsRequestData);
    return result.ok ? result.object : null;
  },
  appendBaseRequestData: appendBaseRequestData,
};
