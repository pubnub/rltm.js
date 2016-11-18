"use strict";

module.exports = function(service, channel, config) {
    return require(__dirname + '/services/' + service)(service, channel, config);
}; 
