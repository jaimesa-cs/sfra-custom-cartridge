'use strict';

function enrich(payload) {
    payload.enrichedBy = "home";
    payload.enriched = true;    
    return payload;
}

module.exports = {
    enrich: enrich
};