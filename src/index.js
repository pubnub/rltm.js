"use strict";

// this is what is returned by new Rltm()
module.exports = function(service, config) {

    // these are available realtime providers and their definitions
    const services = {
        pubnub: require('./services/pubnub'),
        socketio: require('./services/socketio') 
    };

    // use the string ```service``` to determine which file to use
    // and immediately invoke and return the main function
    return services[service](service, config);
}; 
