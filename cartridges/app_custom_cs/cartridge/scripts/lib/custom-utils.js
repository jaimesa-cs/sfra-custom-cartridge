const isJsonRteEmpty = function (rte) {
  if (!rte || !rte.children || rte.children.length === 0) {
    return true;
  }
  return (
    rte.children.length === 1 &&
    rte.children[0].type === "p" &&
    rte.children[0].children.length === 1 &&
    rte.children[0].children[0].text !== undefined &&
    rte.children[0].children[0].text === ""
  );
};

const cslp = function (obj, field, index) {
  var res = "";
  if(!obj || !field) {
    return res;
  }
  const data = Array.isArray(obj) ? obj[index || 0] : obj;

  // if (!isLivePreviewEnabled) return {};
  // if (!areEditTagsEnabled) return {};
  if (!data.$) return res;
  if (index !== undefined) {
    field = field + "__" + index;
  }
  if (!data.$[field]) return res;
  res = data.$[field];
  return res;
};

module.exports = { isJsonRteEmpty: isJsonRteEmpty, cslp: cslp };
