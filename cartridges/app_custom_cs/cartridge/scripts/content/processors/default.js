'use strict';

function process(payload) {
    var p = payload || {};
    p.processed = true;
    p.processedBy = "default";
    return p;
}

module.exports = {
    process: process,
};