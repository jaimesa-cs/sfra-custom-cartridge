'use strict';

const server = require('server');

// Inherit from the base Home controller
server.extend(module.superModule);

var Contentstack = require('*/cartridge/scripts/services/contentstack'); // Service for interacting with Contentstack API
var CmsHelper = require('*/cartridge/scripts/helpers/cmsHelper');

// Add or override logic in Home-Show
server.append('Show', function (req, res, next) {
  var viewData = res.getViewData();

  // Fetch CMS data from Contentstack
  var contentTypeUid = 'home';
  var data = Contentstack.getCmsData({
    content_type_uid: contentTypeUid,
    query: '{"url":"/"}',
    apiSlug: 'v3/content_types/' + contentTypeUid + '/entries',
    includes: [
      'global_configuration.promotion_bar',
      'components.elements.banner.existing_banner',
    ],
    queryType: 'default',
    req: req,
    request: request,
  });

  if (data && data.entries && data.entries.length > 0) {
    var entry = data.entries[0];
    viewData.cmsData = entry;
    viewData.cmsHelper = CmsHelper;
    viewData.cmsUtils = require('*/cartridge/scripts/lib/custom-utils');
  }
  viewData.isLivePreview = CmsHelper.isLivePreviewEnabled();
  res.setViewData(viewData);
  return next();
});

module.exports = server.exports();
