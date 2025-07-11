var lpUtils = require("*/cartridge/scripts/lib/contentstack-utils");
var Site = require("dw/system/Site");
var sitePrefs = Site.getCurrent();

const renderOption = {
  span: (node, next) => next(node.children),
};

const rteToHtml = (doc) => {
  const fakeEntry = {
    uid: "fake",
    field: doc,
  };

  lpUtils.jsonToHTML({
    entry: fakeEntry,
    paths: ["field"],
    renderOption: renderOption,
  });
  return fakeEntry.field;
};

const isLivePreviewEnabled = () =>{
  var System = require("dw/system/System");
  const instanceTypeEnum = System.getInstanceType();  

  switch (instanceTypeEnum) {
    case System.DEVELOPMENT_SYSTEM:      
    case System.STAGING_SYSTEM:
      return true;      
    default:
      return false;
  }
}

module.exports = Object.assign(
  {
    rteToHtml: rteToHtml,
    api_key: sitePrefs.getCustomPreferenceValue("cmsApiKey"),
    environment: sitePrefs.getCustomPreferenceValue("cmsEnvironment"),
    isLivePreviewEnabled: isLivePreviewEnabled
  },
  lpUtils
);
