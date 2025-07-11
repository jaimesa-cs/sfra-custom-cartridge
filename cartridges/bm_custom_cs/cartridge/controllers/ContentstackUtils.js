"use strict";

const server = require("server");
const Transaction = require("dw/system/Transaction");
const FolderMgr = require("dw/content/FolderMgr");
const ContentMgr = require("dw/content/ContentMgr");
var Contentstack = require('*/cartridge/scripts/services/contentstack'); // Service for interacting with Contentstack API

server.post(
  "CreateAndAssignFolder",
  server.middleware.https,
  function (req, res, next) {
    const folderId = req.form.folderId;
    const folderName = req.form.folderName;
    const assetId = req.form.assetId;

    if (!folderId || !folderName) {
      res.json({
        success: false,
        message: "folderId and folderName are required",
      });
      return next();
    }

    let folder = FolderMgr.getFolder(folderId);

    Transaction.wrap(() => {
      if (!folder) {
        folder = FolderMgr.createFolder(folderId);
        folder.setDisplayName(folderName);
      }
    });

    let assigned = false;
    if (assetId) {
      const asset = ContentMgr.getContent(assetId);
      if (!asset) {
        res.json({
          success: false,
          message: `Content asset with ID '${assetId}' not found.`,
        });
        return next();
      }

      Transaction.wrap(() => {
        asset.setFolder(folder);
      });

      assigned = true;
    }

    res.json({
      success: true,
      folderId: folder.getID(),
      folderName: folder.getDisplayName(),
      assigned: assigned,
    });

    return next();
  }
);

server.get(
  "GetAssetFolder",
  server.middleware.https,
  function (req, res, next) {
    const assetId = req.querystring.assetId;

    if (!assetId) {
      res.json({ success: false, message: "assetId is required" });
      return next();
    }

    const asset = ContentMgr.getContent(assetId);

    if (!asset) {
      res.json({
        success: false,
        message: `Content asset with ID '${assetId}' not found.`,
      });
      return next();
    }

    const folder = asset.getFolder();

    if (!folder) {
      res.json({
        success: true,
        folderId: null,
        folderName: null,
        message: "No folder assigned.",
      });
    } else {
      res.json({
        success: true,
        folderId: folder.getID(),
        folderName: folder.getDisplayName(),
      });
    }

    return next();
  }
);

server.get('HTML', function (req, res, next) {
  // var ContentMgr = require("dw/content/ContentMgr");
  // var pageMetaHelper = require("*/cartridge/scripts/helpers/pageMetaHelper");
  // res.setHttpHeader("Access-Control-Allow-Origin", "http://localhost:3005");
  var origin = req.httpHeaders.get('origin');
  if (origin !== null && allowedOrigins.includes(origin)) {
    res.setHttpHeader('Access-Control-Allow-Origin', origin);
  }
  var cid = req.querystring.cid || '';

  // var apiContent = ContentMgr.getContent(req.querystring.cid);
  var requestData = Contentstack.getRequestData(
    {
      content_type_uid: 'content_asset',
      query: '{"cid":"' + cid + '"}',
    },
    'default',
    req,
    request
  );
  // Fetch CMS data from Contentstack
  var data = Contentstack.getCmsData(requestData);
  var viewData = res.getViewData();
  if (data && data.entries && data.entries.length > 0) {
    var entry = data.entries[0];    
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


