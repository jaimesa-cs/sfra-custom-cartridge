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

const getHost = function (requestData) {
  var host = requestData.endpoint;
  if (requestData && requestData.live_preview) {
    host = requestData.preview_endpoint;
  }
  return host;
};

const prepareHeaders = function (svc, requestData) {
  svc.addHeader("Content-Type", "application/json");
  svc.addHeader("api_key", requestData.api_key);
  svc.setRequestMethod(requestData.method);

  if (requestData.variant) {
    svc.addHeader("x-cs-variant-uid", requestData.variant);
  }
  if (requestData && requestData.live_preview) {
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
};

const getPersonalizeService = function (userId, requestData) {
  const pageUrl = requestData.pageUrl;
  var personalizeService = LocalServiceRegistry.createService(
    "Contentstack.Personalize.Service",
    {
      createRequest: function (svc, httpClient) {
        svc.setURL(`https://personalize-edge.contentstack.com/manifest`);
        svc.addHeader("Content-Type", "application/json");
        svc.addHeader("x-project-uid", "680fbf769fb4d1e7c68e5c65");
        svc.addHeader("x-page-url", pageUrl);
        svc.addHeader("x-cs-personalize-user-uid", userId);
        svc.setRequestMethod("GET");
        // svc.setURL(url);
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
      getRequestLogMessage: function (request) {
        return JSON.stringify(request);
      },

      getResponseLogMessage: function (response) {
        return response.text;
      },
    }
  );
  return personalizeService;
};

const getContentService = function (requestData) {
  var contentstackService = LocalServiceRegistry.createService(
    "Contentstack.Content.Service",
    {
      createRequest: function (svc, httpClient) {
        var host = getHost(requestData);
        prepareHeaders(svc, requestData);
        //Content Type Based Query
        const url = `${host}/${requestData.apiSlug}/entries?environment=${requestData.environment}&locale=${requestData.locale}&query=${requestData.encodedQuery}`;
        svc.setURL(url);
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
      getRequestLogMessage: function (request) {
        return JSON.stringify(request);
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
    const contentstackService = getContentService(cmsRequestData);
    var result = contentstackService.call(cmsRequestData);
    return result.ok ? result.object : null;
  },
  getPersonalizeManifest: function (userId, requestData) {
    const cmsRequestData = appendBaseRequestData(requestData);
    const personalizeService = getPersonalizeService(userId, cmsRequestData);
    var result = personalizeService.call();
    return result.ok ? result.object : null;
  },
  appendBaseRequestData: appendBaseRequestData,
};
