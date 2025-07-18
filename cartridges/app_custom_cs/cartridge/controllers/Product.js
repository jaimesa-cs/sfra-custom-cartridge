'use strict';

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
var server = require('server');
server.extend(module.superModule);

var Contentstack = require('*/cartridge/scripts/services/contentstack'); // Service for interacting with Contentstack
var CmsHelper = require('*/cartridge/scripts/helpers/cmsHelper');

var allowedOrigins = [
  'http://localhost:3005',
  'https://sfra-url-custom-field.contentstackapps.com',
];

/**
 * Enriches the view data with CMS data from Contentstack.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
function enrichViewDataFromCms(req, res) {
  var viewData = res.getViewData();

  // If no product ID is provided, skip enrichment
  if (req.querystring && !req.querystring.pid) {
    return;
  }

  // Construct request data for Contentstack
  var contentTypeUid = 'product_page';

  // Fetch CMS data from Contentstack
  var data = Contentstack.getCmsData({
    content_type_uid: contentTypeUid,
    query: '{"product.data.id":"' + req.querystring.pid + '"}',
    queryType: 'url',
    req: req,
    request: request,
  });

  if (data && data.entries && data.entries.length > 0) {
    var entry = data.entries[0];
    var productData = entry;

    // Handle default product details
    if (productData.elements && productData.elements.length > 0) {
      const defaultProductDetailsFound = productData.elements.filter(
        (e) => Object.keys(e)[0] === 'default_product_details'
      );
      let showDefaultProductDetails = false;
      let defaultProductDetails = null;

      if (defaultProductDetailsFound && defaultProductDetailsFound.length > 0) {
        defaultProductDetails =
          defaultProductDetailsFound[0].default_product_details;
        showDefaultProductDetails = true;
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
          (e) => Object.keys(e)[0] !== 'default_product_details'
        );
      }
    }

    // Add CMS data and helpers to the view data
    viewData.cmsData = productData;
    viewData.cmsHelper = CmsHelper;
    viewData.cmsUtils = require('*/cartridge/scripts/lib/custom-utils');
  }

  // Indicate if live preview is enabled
  viewData.isLivePreview = CmsHelper.isLivePreviewEnabled();
  res.setViewData(viewData);
}

// Append custom logic to the "Show" route
server.append('Show', function (req, res, next) {
  enrichViewDataFromCms(req, res);
  next();
});

// Debug route to return JSON data (for development purposes only)
server.get('JSON', function (req, res, next) {
  // res.setHttpHeader("Access-Control-Allow-Origin", "http://localhost:3005");
  const origin = req.httpHeaders.get('origin');
  if (origin !== null && allowedOrigins.includes(origin)) {
    res.setHttpHeader('Access-Control-Allow-Origin', origin);
  }

  var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
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
