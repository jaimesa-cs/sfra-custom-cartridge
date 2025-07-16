'use strict';

function enrich(payload) {
    var p = payload || {};
    p.enriched = true;
    p.enrichedBy = "default";
    return p;
}

module.exports = {
    enrich: enrich,
};