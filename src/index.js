"use strict";

module.exports = function(service, config) {

    const services = {
        pubnub: require('./services/pubnub'),
        socketio: require('./services/socketio') 
    };

    return services[service](service, config);
}; 
