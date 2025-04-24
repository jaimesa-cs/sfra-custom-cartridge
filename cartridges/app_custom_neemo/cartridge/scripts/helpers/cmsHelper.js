var lpUtils = require("*/cartridge/scripts/lib/contentstack-utils");

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

module.exports = {
  rteToHtml: rteToHtml,
};
