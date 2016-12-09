"use strict";

// this is what is returned by new Rltm()
module.exports = function(setup) {

    // these are available realtime providers and their definitions
    const services = {
        pubnub: require('./services/pubnub'),
        socketio: require('./services/socketio') 
    };
    
    // return error if service is not set
    let service = services[setup.service];

    if(!setup.service) {
        console.error('You must supply a service property.');
    }
    
    if(!service) {
        console.error('The service you supplied is invalid.');
    } 
    
    // add config if doesn't exist
    setup.config = setup.config || {};

    // set a default uuid if it has not been set for this client
    setup.config.uuid = setup.config.uuid || new Date();

    // set this uuid if it is not set
    setup.config.state = setup.config.state || {};

    // immediately invoke and return the main function
    return new service(setup);

}; 
