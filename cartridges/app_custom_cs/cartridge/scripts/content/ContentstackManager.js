'use strict';
const ENRICHERS = {
    'default': require("*/cartridge/scripts/content/enrichers/defaultEnricher"),
    'home': require("*/cartridge/scripts/content/enrichers/home")
}

function enrichPayload(payload, contentType) {
    var result = ENRICHERS.default.enrich(payload);
    
    if(contentType){
        var enricher = ENRICHERS[contentType];
        if (enricher) {
            result = enricher.enrich(payload);
        }
    }

    return result;
}

module.exports = {
    enrichPayload: enrichPayload,
};