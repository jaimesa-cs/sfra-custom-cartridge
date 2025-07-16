"use strict";

// Import required modules
var LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");
var Site = require("dw/system/Site");
var Locale = require("dw/util/Locale");
var ContentstackManager = require("*/cartridge/scripts/content/ContentstackManager");
/**
 * Appends base request data required for Contentstack API calls.
 * This includes API keys, environment, locale, and other configuration values.
 *
 * @param {Object} appendRequestData - The request data to which base data will be appended.
 * @returns {Object} The updated request data object.
 */
var appendBaseRequestData = function (appendRequestData) {
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
    preview_endpoint: sitePrefs.getCustomPreferenceValue(
      "cmsPreviewApiEndpoint"
    ),
    access_token: sitePrefs.getCustomPreferenceValue("cmsAccessToken"),
    api_key: sitePrefs.getCustomPreferenceValue("cmsApiKey"),
    environment: sitePrefs.getCustomPreferenceValue("cmsEnvironment"),
    branch: sitePrefs.getCustomPreferenceValue("cmsBranch"), // There's a typo in Business Manager, it should be "cmsBranch"
    edge_api_endpoint: sitePrefs.getCustomPreferenceValue("cmsEdgeApiEndpoint"),
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
var getHost = function (requestData) {
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
var prepareHeaders = function (svc, requestData) {
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
var getPersonalizeService = function (userId, requestData) {
  var pageUrl = requestData.pageUrl;
  var edgeApiEndpoint = requestData.edge_api_endpoint;
  var personalizeProjectUid = requestData.personalize_project_uid;

  var personalizeService = LocalServiceRegistry.createService(
    "Contentstack.Personalize.Service",
    {
      createRequest: function (svc, httpClient) {
        svc.setURL(edgeApiEndpoint + "/manifest");
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
var getContentService = function (requestData) {
  var contentstackService = LocalServiceRegistry.createService(
    "Contentstack.Content.Service",
    {
      createRequest: function (svc, httpClient) {
        var host = getHost(requestData);
        prepareHeaders(svc, requestData);
        // Construct the URL for the content request
        //&include[]=categories&include[]=tags
        var includes = requestData.includes
          ? requestData.includes.map((include) => "include[]=" + include).join("&")
          : "";
        includes = includes ? "&" + includes : "";
        var url =
          host +
          "/" +
          requestData.apiSlug +
          "?environment=" +
          requestData.environment +
          "&locale=" +
          requestData.locale +
          "&query=" +
          requestData.encodedQuery +
          includes +
          "&include_dimension=true&include_applied_variants=true";
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

/**
 * Constructs the request data object based on the type of request.
 * @param {string} type - The type of request (e.g., "url", "taxonomy").
 * @param {Object} req - The local request object.
 * @param {Object} request - The global controller request object.
 * @returns {Object} The constructed request data object.
 */
var getRequestData = function (apiData, type, req, request) {
  var Site = require("dw/system/Site");
  var sitePrefix = "/s/" + Site.current.ID;
  var result = Object.assign({}, apiData);
  result = Object.assign(result, {
    pageUrl:
      "https://" +
      req.httpHeaders.get("x-is-host") +
      req.httpHeaders.get("x-is-path_info") +
      "?" +
      req.httpHeaders.get("x-is-query_string"), // Get the URL from the request headers
    queryType: type,
    method: "GET",
  });

  switch (type) {
    case "url":
      // Content Type Based Queries
      var slugUrl = req.httpHeaders.get("x-is-path_info").replace(sitePrefix, ''); // Get the URL from the request headers
      result = Object.assign(result, {
        queryType: "content_type",
        query: '{"url":"' + slugUrl + '"}',
        content_type_uid: apiData.content_type_uid, // Content type UID for product pages
        apiSlug:
          apiData.apiSlug || "v3/content_types/" + apiData.content_type_uid +"/entries",
      });
      break;

    //TODO: PARAMETERIZE THIS
    case "taxonomy":
      // Taxonomy-Based Queries
      result = Object.assign(result, {
        queryType: "taxonomy",
        query:
          '{ "taxonomies.page_types" : "pdp", "_content_type_uid": "product_page" }',
        apiSlug: apiData.apiSlug || "v3/taxonomies",
      });
      break;

    default:
      // Default to Content Type Based Queries
      result = Object.assign(result, {
        queryType: "content_type",
        query: apiData.query,
        content_type_uid: apiData.content_type_uid,
        apiSlug:
          apiData.apiSlug || "v3/content_types/" + apiData.content_type_uid,
      });
      break;
  }

  // Encode and decode the query for safe transmission
  if (result.query) {
    var decodedQuery = decodeURIComponent(result.query);
    result.encodedQuery = encodeURIComponent(decodedQuery);
  }

  // Merge additional query string parameters
  if (req.querystring) {
    result = Object.assign(result, req.querystring);
  }

  if (request.httpCookies && request.httpCookies["cs-personalize-user-uid"]) {
    // Retrieve user ID from cookies for personalization
    var userId = request.httpCookies["cs-personalize-user-uid"].value;
    // Add personalization variant UID if available
    appendPersonalizeData(userId, result);
  }

  return result;
};
/**
 * Retrieves the personalization manifest from Contentstack.
 *
 * @param {string} userId - The user ID for personalization.
 * @param {Object} requestData - The request data object.
 * @returns {Object|null} The personalization manifest or null if the request fails.
 */
var getPersonalizeManifest = function (userId, requestData) {
  var cmsRequestData = appendBaseRequestData(requestData);
  var personalizeService = getPersonalizeService(userId, cmsRequestData);
  var result = personalizeService.call();
  return result.ok ? result.object : null;
};

/**
 * Appends personalization data to the request data object.
 *
 * @param {string} userId - The user ID for personalization.
 * @param {Object} requestData - The request data object.
 */
var appendPersonalizeData = function (userId, requestData) {
  // Get the personalization manifest from Contentstack
  var manifest = getPersonalizeManifest(userId, requestData);
  if (manifest && manifest.experiences && manifest.experiences.length > 0) {
    var experience = manifest.experiences[0];
    if (experience) {
      var variantUid =
        "cs_personalize_" +
        experience.shortUid +
        "_" +
        experience.activeVariantShortUid;
      requestData.variant = variantUid;
    }
  }
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
    var cmsRequestData = appendBaseRequestData(requestData);
    var contentstackService = getContentService(cmsRequestData);
    var result = contentstackService.call(cmsRequestData);
    var payload = result.ok ? result.object : null;
    //Enrich the payload
    if (payload && payload.entries && payload.entries.length > 0) {
      for (var i = 0; i < payload.entries.length; i++) {
        var entry = payload.entries[i];
        // Enrich each entry in the payload
        entry = ContentstackManager.processPayload(entry, requestData.content_type_uid);
        payload.entries[i] = entry;
      }
    }
    return payload;
  },

  // Utility function to append base request data
  appendBaseRequestData: appendBaseRequestData,
  getRequestData: getRequestData,
};
