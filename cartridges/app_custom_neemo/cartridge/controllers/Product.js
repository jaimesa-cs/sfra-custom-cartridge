"use strict";

var server = require("server");
server.extend(module.superModule);

var lpUtils = require("*/cartridge/scripts/lib/contentstack-utils");
function enrichViewDataFromCms(req, res) {
  var viewData = res.getViewData();
  if (req.querystring && !req.querystring.pid) {
    return;
  }
  var requestData = {
    query: `{"product.data.id":"${req.querystring.pid}"}`,
    content_type_uid: "product_page",
  };
  if (req.querystring) {
    requestData = Object.assign(requestData, req.querystring);
  }
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
        true,
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

module.exports = server.exports();
