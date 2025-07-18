'use strict';

// Import required modules
var server = require('server');
server.extend(module.superModule);

var Contentstack = require('*/cartridge/scripts/services/contentstack'); // Service for interacting with Contentstack API
var CmsHelper = require('*/cartridge/scripts/helpers/cmsHelper');

var allowedOrigins = [
  'http://localhost:3005',
  'https://sfra-url-custom-field.contentstackapps.com',
];

// Append custom logic to the "Show" route
server.append('Show', function (req, res, next) {
  var viewData = res.getViewData();
  var data = null;

  var pageType = 'unknown';

  // Fetch CMS data from Contentstack
  if (req.querystring.cid) {
    data = Contentstack.getCmsData({
      content_type_uid: 'content_asset',
      query: '{"cid":"' + req.querystring.cid + '"}',
      apiSlug: 'v3/content_types/content_asset/entries',
      queryType: 'default',
      req: req,
      request: request,
    });
    pageType = 'content_asset';
  } else if (
    req.querystring.u && //url slug
    req.querystring.c && //content type
    req.querystring.p //prefix
  ) {
    const url =
      req.querystring.p + '/' + req.querystring.u.toString().split('?')[0];
    const ct = req.querystring.c;

    data = Contentstack.getCmsData({
      content_type_uid: ct,
      query: '{"url":"' + url + '"}',
      apiSlug: 'v3/content_types/' + ct + '/entries',
      includes: [
        'global_configuration.promotion_bar',
        'components.elements.banner.existing_banner',
      ],
      queryType: 'default',
      req: req,
      request: request,
    });
    pageType = ct;
  }
  if (data && data.entries && data.entries.length > 0) {
    var entry = data.entries[0];
    // Add editable tags for live preview
    var viewData = res.getViewData();
    viewData.cmsData = entry;
    viewData.cmsHelper = CmsHelper;
    viewData.cmsUtils = require('*/cartridge/scripts/lib/custom-utils');
  }
  viewData.isLivePreview = CmsHelper.isLivePreviewEnabled();
  res.setViewData(viewData);
  switch (pageType) {
    case 'page':
      res.render('pages/page');
      break;
    default:
      break;
  }
  return next();
});

// Debug route to return JSON data (for development purposes only)
server.get('HTML', function (req, res, next) {
  // var ContentMgr = require("dw/content/ContentMgr");
  // var pageMetaHelper = require("*/cartridge/scripts/helpers/pageMetaHelper");
  // res.setHttpHeader("Access-Control-Allow-Origin", "http://localhost:3005");
  var origin = req.httpHeaders.get('origin');
  if (origin !== null && allowedOrigins.includes(origin)) {
    res.setHttpHeader('Access-Control-Allow-Origin', origin);
  }
  var cid = req.querystring.cid || '';

  // Fetch CMS data from Contentstack
  var contentTypeUid = 'content_asset';

  var data = Contentstack.getCmsData({
    content_type_uid: contentTypeUid,
    query: '{"cid":"' + cid + '"}',
    apiSlug: 'v3/content_types/' + contentTypeUid + '/entries',
    queryType: 'default',
    req: req,
    request: request,
  });
  var viewData = res.getViewData();
  if (data && data.entries && data.entries.length > 0) {
    var entry = data.entries[0];
    // viewData.content = apiContent;
    viewData.cmsData = entry;
    viewData.cmsHelper = require('*/cartridge/scripts/helpers/cmsHelper');
    viewData.cmsUtils = require('*/cartridge/scripts/lib/custom-utils');
  }
  res.setViewData(viewData);
  res.render('content/contentAssetFragment');
  next();
});

// Export the server module
module.exports = server.exports();
