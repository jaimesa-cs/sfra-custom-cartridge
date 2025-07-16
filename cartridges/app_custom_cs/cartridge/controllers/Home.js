"use strict";

const server = require("server");

// Inherit from the base Home controller
server.extend(module.superModule);

var lpUtils = require("*/cartridge/scripts/lib/contentstack-utils"); // Utility functions for Contentstack live preview
var Contentstack = require("*/cartridge/scripts/services/contentstack"); // Service for interacting with Contentstack API
var CmsHelper = require("*/cartridge/scripts/helpers/cmsHelper");


// Add or override logic in Home-Show
server.append("Show", function (req, res, next) {
    var viewData = res.getViewData();    
    var requestData = Contentstack.getRequestData(
      {
        content_type_uid: "home",
        query: '{"url":"/"}',
        apiSlug: "v3/content_types/home/entries",
        includes: [
          "global_configuration.promotion_bar",
          "components.elements.banner.existing_banner",
        ],
      },

      "default",
      req,
      request
    );
    // Fetch CMS data from Contentstack
    var data = Contentstack.getCmsData(requestData);

    if (data && data.entries && data.entries.length > 0) {
        var entry = data.entries[0];

        // Add editable tags for live preview
        if (CmsHelper.isLivePreviewEnabled()) {
            lpUtils.addEditableTags(
                entry,
                requestData.content_type_uid,
                false,
                requestData.locale
            );
        }        
        viewData.cmsData = entry;
        viewData.cmsHelper = CmsHelper;
        viewData.cmsUtils = require('*/cartridge/scripts/lib/custom-utils');
    }
    viewData.isLivePreview = CmsHelper.isLivePreviewEnabled();
    res.setViewData(viewData);
    return next();
});

module.exports = server.exports();
