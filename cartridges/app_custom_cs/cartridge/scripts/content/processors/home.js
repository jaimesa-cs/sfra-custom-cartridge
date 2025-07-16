'use strict';

function process(payload) {
    payload.processedBy = "home";
    payload.processed = true;    
    return payload;
}

module.exports = {
    process: process
};