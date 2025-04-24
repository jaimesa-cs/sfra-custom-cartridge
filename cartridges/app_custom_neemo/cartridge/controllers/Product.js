"use strict";

var server = require("server");
server.extend(module.superModule);

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
    const productData = data.entries[0];
    if (productData.elements && productData.elements.length > 0) {
      const productDetailsFound = productData.elements.filter(
        (e) => Object.keys(e)[0] === "product_details"
      );
      if (productDetailsFound && productDetailsFound.length > 0) {
        const productDetails = productDetailsFound[0].product_details;
        viewData.cmsProductDetails = productDetails;
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
