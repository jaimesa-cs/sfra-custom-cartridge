"use strict";

// Import required modules
var LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");
var Site = require("dw/system/Site");
var Locale = require("dw/util/Locale");

/**
 * Appends base request data required for Contentstack API calls.
 * This includes API keys, environment, locale, and other configuration values.
 *
 * @param {Object} appendRequestData - The request data to which base data will be appended.
 * @returns {Object} The updated request data object.
 */
const appendBaseRequestData = function (appendRequestData) {
  var sitePrefs = Site.getCurrent();
  var currentLocale = Locale.getLocale(request.locale); // Get the current locale
  var language = currentLocale.language; // e.g., "en"
  var country = currentLocale.country;
  var locale =
    currentLocale && currentLocale.language && currentLocale.country
      ? (language + "-" + country).toLowerCase()
      : "en-us"; // Default to "en-us" if locale is not found

  var requestData = {
    endpoint: sitePrefs.getCustomPreferenceValue("cmsApiEndpoint"),
    preview_endpoint: sitePrefs.getCustomPreferenceValue("cmsPreviewEndpoint"),
    access_token: sitePrefs.getCustomPreferenceValue("cmsAccessToken"),
    api_key: sitePrefs.getCustomPreferenceValue("cmsApiKey"),
    environment: sitePrefs.getCustomPreferenceValue("cmsEnvironment"),
    branch: sitePrefs.getCustomPreferenceValue("cmsBranch"), // There's a typo in Business Manager, it should be "cmsBranch"
    edge_api_endpoint: sitePrefs.getCustomPreferenceValue(
      "cmsPersonalizeEndpoint"
    ),
    personalize_project_uid: sitePrefs.getCustomPreferenceValue(
      "cmsPersonalizeProjectUID"
    ),
    preview_token: sitePrefs.getCustomPreferenceValue("cmsPreviewToken"),
    locale: locale || "en-us", // Default to "en-us" if locale is not found
  };

  // Merge the base request data with the provided request data
  if (appendRequestData) {
    Object.assign(appendRequestData, requestData);
  }
  return appendRequestData;
};

/**
 * Determines the appropriate host URL based on whether live preview is enabled.
 *
 * @param {Object} requestData - The request data object.
 * @returns {string} The host URL.
 */
const getHost = function (requestData) {
  var host = requestData.endpoint;
  if (requestData && requestData.live_preview) {
    host = requestData.preview_endpoint;
  }
  return host;
};

/**
 * Prepares the headers for the Contentstack API request.
 *
 * @param {dw.svc.Service} svc - The service instance.
 * @param {Object} requestData - The request data object.
 */
const prepareHeaders = function (svc, requestData) {
  svc.addHeader("Content-Type", "application/json");
  svc.addHeader("api_key", requestData.api_key);
  svc.setRequestMethod(requestData.method);

  // Add headers for personalization or live preview if applicable
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

/**
 * Creates a service for retrieving the personalization manifest from Contentstack.
 *
 * @param {string} userId - The user ID for personalization.
 * @param {Object} requestData - The request data object.
 * @returns {dw.svc.Service} The personalization service instance.
 */
const getPersonalizeService = function (userId, requestData) {
  const pageUrl = requestData.pageUrl;
  const edgeApiEndpoint = requestData.edge_api_endpoint;
  const personalizeProjectUid = requestData.personalize_project_uid;

  var personalizeService = LocalServiceRegistry.createService(
    "Contentstack.Personalize.Service",
    {
      createRequest: function (svc, httpClient) {
        svc.setURL(`${edgeApiEndpoint}/manifest`);
        svc.addHeader("Content-Type", "application/json");
        svc.addHeader("x-project-uid", personalizeProjectUid);
        svc.addHeader("x-page-url", pageUrl);
        svc.addHeader("x-cs-personalize-user-uid", userId);
        svc.setRequestMethod("GET");
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

/**
 * Creates a service for retrieving content from Contentstack.
 *
 * @param {Object} requestData - The request data object.
 * @returns {dw.svc.Service} The content service instance.
 */
const getContentService = function (requestData) {
  var contentstackService = LocalServiceRegistry.createService(
    "Contentstack.Content.Service",
    {
      createRequest: function (svc, httpClient) {
        var host = getHost(requestData);
        prepareHeaders(svc, requestData);
        // Construct the URL for the content request
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

// Exported functions for interacting with Contentstack
module.exports = {
  /**
   * Retrieves CMS data from Contentstack.
   *
   * @param {Object} requestData - The request data object.
   * @returns {Object|null} The CMS data or null if the request fails.
   */
  getCmsData: function (requestData) {
    const cmsRequestData = appendBaseRequestData(requestData);
    const contentstackService = getContentService(cmsRequestData);
    var result = contentstackService.call(cmsRequestData);
    return result.ok ? result.object : null;
  },

  /**
   * Retrieves the personalization manifest from Contentstack.
   *
   * @param {string} userId - The user ID for personalization.
   * @param {Object} requestData - The request data object.
   * @returns {Object|null} The personalization manifest or null if the request fails.
   */
  getPersonalizeManifest: function (userId, requestData) {
    const cmsRequestData = appendBaseRequestData(requestData);
    const personalizeService = getPersonalizeService(userId, cmsRequestData);
    var result = personalizeService.call();
    return result.ok ? result.object : null;
  },

  // Utility function to append base request data
  appendBaseRequestData: appendBaseRequestData,
};
