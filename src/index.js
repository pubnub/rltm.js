"use strict";

module.exports = function(service, channel, config) {

    return require('./services/' + service)(channel, config);
}; 
