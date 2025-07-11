"use strict";

const server = require("server");
const Transaction = require("dw/system/Transaction");
const FolderMgr = require("dw/content/FolderMgr");
const ContentMgr = require("dw/content/ContentMgr");

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

module.exports = server.exports();
