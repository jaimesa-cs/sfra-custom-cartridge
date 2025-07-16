'use strict';
const PROCESSORS = {
  default: require("*/cartridge/scripts/content/processors/default"),
  home: require("*/cartridge/scripts/content/processors/home"),
};

function processPayload(payload, contentType) {
    var result = PROCESSORS.default.process(payload);
    
    if(contentType){
        var processor = PROCESSORS[contentType];
        if (processor) {
            result = processor.process(payload);
        }
    }

    return result;
}

module.exports = {
    processPayload: processPayload,
};