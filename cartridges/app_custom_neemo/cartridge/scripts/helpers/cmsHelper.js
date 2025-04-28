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
  // return "$Nick!!";
};

module.exports = Object.assign(
  {
    rteToHtml: rteToHtml,
    api_key: sitePrefs.getCustomPreferenceValue("cmsApiKey"),
    environment: sitePrefs.getCustomPreferenceValue("cmsEnvironment"),
  },
  lpUtils
);
