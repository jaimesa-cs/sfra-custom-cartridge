"use strict";

/**
 * Product Controller
 *
 * This controller extends the default Product controller in SFRA to include
 * additional functionality for integrating with Contentstack's API. It enriches
 * the product details page with CMS data and provides a debug endpoint for
 * retrieving product-related JSON data.
 *
 * Features:
 * - Enriches product view data with Contentstack CMS data.
 * - Handles personalization using Contentstack's personalization manifest.
 * - Adds support for live preview functionality.
 * - Provides a debug endpoint to return product data in JSON format.
 */

// Import required modules
var server = require("server");
server.extend(module.superModule);

var lpUtils = require("*/cartridge/scripts/lib/contentstack-utils"); // Utility functions for Contentstack live preview
var customUtils = require("*/cartridge/scripts/lib/custom-utils"); // Custom utility functions
var Contentstack = require("*/cartridge/scripts/services/contentstack"); // Service for interacting with Contentstack API

/**
 * Constructs the request data object based on the type of request.
 * @param {string} type - The type of request (e.g., "url", "taxonomy").
 * @param {Object} req - The request object.
 * @returns {Object} The constructed request data object.
 */
function getRequestData(type, req) {
  let result = {
    queryType: type,
    method: "GET",
  };

  switch (type) {
    case "url":
      // Content Type Based Queries
      const slugUrl = req.httpHeaders.get("x-is-path_info"); // Get the URL from the request headers
      result = Object.assign(result, {
        queryType: "content_type",
        query: `{"url":"${slugUrl}"}`,
        content_type_uid: "product_page", // Content type UID for product pages
        apiSlug: "v3/content_types/product_page",
      });
      break;

    case "taxonomy":
      // Taxonomy-Based Queries
      result = Object.assign(result, {
        queryType: "taxonomy",
        query: `{ "taxonomies.page_types" : "pdp", "_content_type_uid": "product_page" }`,
        apiSlug: "v3/taxonomies",
      });
      break;

    default:
      // Default to Content Type Based Queries
      result = Object.assign(result, {
        queryType: "content_type",
        query: `{"product.data.id":"${req.querystring.pid}"}`,
        content_type_uid: "product_page",
        apiSlug: "v3/content_types/product_page",
      });
      break;
  }

  // Encode and decode the query for safe transmission
  if (result.query) {
    const decodedQuery = decodeURIComponent(result.query);
    result.encodedQuery = encodeURIComponent(decodedQuery);
  }

  // Merge additional query string parameters
  if (req.querystring) {
    result = Object.assign(result, req.querystring);
  }

  return result;
}

/**
 * Enriches the view data with CMS data from Contentstack.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
function enrichViewDataFromCms(req, res) {
  var viewData = res.getViewData();

  // If no product ID is provided, skip enrichment
  if (req.querystring && !req.querystring.pid) {
    return next();
  }

  // Construct request data for Contentstack
  const requestData = getRequestData("url", req);

  // Retrieve user ID from cookies for personalization
  let userId = null;
  if (request.httpCookies && request.httpCookies["cs-personalize-user-uid"]) {
    userId = request.httpCookies["cs-personalize-user-uid"].value;
  }

  // Get the personalization manifest from Contentstack
  const manifest = Contentstack.getPersonalizeManifest(userId);

  // Add personalization variant UID if available
  if (manifest && manifest.experiences && manifest.experiences.length > 0) {
    const experience = manifest.experiences[0];
    if (experience) {
      const variantUid = `cs_personalize_${experience.shortUid}_${experience.activeVariantShortUid}`;
      requestData.variant = variantUid;
    }
  }

  // Fetch CMS data from Contentstack
  const data = Contentstack.getCmsData(requestData);

  if (data && data.entries && data.entries.length > 0) {
    const entry = data.entries[0];

    // Add editable tags for live preview
    if (requestData.live_preview) {
      lpUtils.addEditableTags(
        entry,
        requestData.content_type_uid,
        false,
        requestData.locale
      );
    }

    const productData = entry;

    // Handle default product details
    if (productData.elements && productData.elements.length > 0) {
      const defaultProductDetailsFound = productData.elements.filter(
        (e) => Object.keys(e)[0] === "default_product_details"
      );
      let showDefaultProductDetails = false;
      let defaultProductDetails = null;

      if (defaultProductDetailsFound && defaultProductDetailsFound.length > 0) {
        defaultProductDetails =
          defaultProductDetailsFound[0].default_product_details;
        showDefaultProductDetails = defaultProductDetails.show;
      }

      viewData.cmsProductDetails = null;

      if (showDefaultProductDetails) {
        if (
          defaultProductDetails.override_default_product_details &&
          defaultProductDetails.override_default_product_details.length > 0
        ) {
          const productDetails =
            defaultProductDetails.override_default_product_details[0];
          viewData.cmsProductDetails = productDetails;
        }
      } else {
        // Remove the block from productData
        productData.elements = productData.elements.filter(
          (e) => Object.keys(e)[0] !== "default_product_details"
        );
      }
    }

    // Add CMS data and helpers to the view data
    viewData.cmsData = productData;
    viewData.cmsHelper = require("*/cartridge/scripts/helpers/cmsHelper");
    viewData.cmsUtils = require("*/cartridge/scripts/lib/custom-utils");
  }

  // Indicate if live preview is enabled
  viewData.isLivePreview = requestData.live_preview !== undefined;
  res.setViewData(viewData);
}

// Append custom logic to the "Show" route
server.append("Show", function (req, res, next) {
  enrichViewDataFromCms(req, res);
  next();
});

// Debug route to return JSON data (for development purposes only)
server.get("JSON", function (req, res, next) {
  res.setHttpHeader("Access-Control-Allow-Origin", "http://localhost:3005");
  var productHelper = require("*/cartridge/scripts/helpers/productHelpers");
  var showProductPageHelperResult = productHelper.showProductPage(
    req.querystring,
    req.pageMetaData
  );

  res.json({
    product: showProductPageHelperResult.product,
    addToCartUrl: showProductPageHelperResult.addToCartUrl,
    resources: showProductPageHelperResult.resources,
    breadcrumbs: showProductPageHelperResult.breadcrumbs,
  });

  next();
});

// Export the server module
module.exports = server.exports();
