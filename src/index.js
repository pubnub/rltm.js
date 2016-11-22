"use strict";

let services = {
    pubnub: require('./services/pubnub'),
    socketio: require('./services/socketio') 
};

module.exports = function(service, channel, config) {
    return services[service](service, channel, config);
}; 
