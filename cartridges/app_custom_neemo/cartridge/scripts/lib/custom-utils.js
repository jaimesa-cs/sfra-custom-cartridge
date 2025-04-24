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

exports.isJsonRteEmpty = isJsonRteEmpty;
