"use strict";

module.exports = function(service, config) {

    return require('./services/' + service)(config);
}; 
