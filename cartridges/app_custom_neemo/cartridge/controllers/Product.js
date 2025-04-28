"use strict";

var server = require("server");
server.extend(module.superModule);

var lpUtils = require("*/cartridge/scripts/lib/contentstack-utils");
var customUtils = require("*/cartridge/scripts/lib/custom-utils");

function getRequestData(type, req) {
  // There are two types of requests:
  let result = {
    queryType: type,
    method: "GET",
  };
  switch (type) {
    case "url":
      //Content Type Based Queries
      //TODO: The url will depend on implementation chosen, in here we rely
      //TODO: on the "x-is-path_info" header to get the url of the page
      const slugUrl = req.httpHeaders.get("x-is-path_info");

      result = Object.assign(result, {
        queryType: "content_type",
        query: `{"url":"${slugUrl}"}`,
        content_type_uid: "product_page", //TODO: Move to Custom Preferences product_page
        apiSlug: "v3/content_types/product_page",
      });
      break;
    case "taxonomy":
      //Single Content Type Taxonomy Based Queries
      // You could construct your query to support multiple content types
      //query={
      // "taxonomies.taxonomy_uid" : "term_uid",
      // "_content_type_uid": { "$in" : ["_content_type_uid1", "_content_type_uid2"] }}
      result = Object.assign(result, {
        queryType: "taxonomy",
        //TODO: Move to Custom Preferences, page_types, pdp and product_page
        query: `{ "taxonomies.page_types" : "pdp", "_content_type_uid": "product_page" }`,
        apiSlug: "v3/taxonomies",
      });
      break;
    default:
      //Defaults to Content Type Based Queries
      result = Object.assign(result, {
        queryType: "content_type",
        query: `{"product.data.id":"${req.querystring.pid}"}`,
        content_type_uid: "product_page", //TODO: Move to Custom Preferences product_page
        apiSlug: "v3/content_types/product_page",
      });
      break;
  }
  if (result.query) {
    const decodedQuery = decodeURIComponent(result.query);
    result.encodedQuery = encodeURIComponent(decodedQuery);
  }
  if (req.querystring) {
    result = Object.assign(result, req.querystring);
  }
  return result;
}

function enrichViewDataFromCms(req, res) {
  var viewData = res.getViewData();
  if (req.querystring && !req.querystring.pid) {
    return;
  }

  // You can retrieve entries using the content_type_uid or the taxonomy_uid+term_uid
  // const requestData = getRequestData("content_type", req);
  // const requestData = getRequestData("taxonomy", req);
  const requestData = getRequestData("url", req);

  const data = require("*/cartridge/scripts/services/contentstack").getCmsData(
    requestData
  );

  if (data && data.entries && data.entries.length > 0) {
    //We do some data transformation here
    //to make sure the data is in the right format for the template
    //We can also use the cmsHelper to transform the data
    const entry = data.entries[0];
    if (requestData.live_preview) {
      lpUtils.addEditableTags(
        entry,
        requestData.content_type_uid,
        false,
        requestData.locale
      );
    }
    const productData = entry;
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
        //delete the block from productData
        productData.elements = productData.elements.filter(
          (e) => Object.keys(e)[0] !== "default_product_details"
        );
      }

      //remove the product_details element from the productData
    }

    viewData.cmsData = productData;
    viewData.cmsHelper = require("*/cartridge/scripts/helpers/cmsHelper");
    viewData.cmsUtils = require("*/cartridge/scripts/lib/custom-utils");
  }
  res.setViewData(viewData);
}

server.append("Show", function (req, res, next) {
  enrichViewDataFromCms(req, res);
  next();
});

//TODO: Delete/Modify for production
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
  // res.json({
  //   name: "Test Product",
  //   id: req.querystring.pid || "test123",
  //   price: 19.99,
  // });

  next();
});

module.exports = server.exports();
