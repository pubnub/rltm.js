"use strict";

// include the NodeJS event emitter
const EventEmitter = require('events');

// include the PubNub javascript sdk v4
const PubNub = require('pubnub');

// represents a connection to a single channel
class Room extends EventEmitter {
    constructor(pubnub, channel, uuid, state) {

        // call the EventEmitter constructor
        super();

        // determine the client's state 
        this.state = state || {};

        // store this clients uuid
        this.uuid = uuid;

        // assign the channel parameter as a property
        this.channel = channel;

        // save pubnub in the instance of room
        this.pubnub = pubnub;

        // use the PubNub library to listen for messages
        this.pubnub.addListener({
            status: (statusEvent) => {

                // detect if this is a connection event on this channel
                if (statusEvent.category === "PNConnectedCategory" 
                    && statusEvent.affectedChannels.indexOf(channel) > -1) {
                 
                    // tell the client that first connection made
                    this.emit('ready');

                }
            },
            message: (m) => {

                // if message is sent to this specific channel
                if(channel == m.channel) {

                    // emit the message as an event
                    this.emit('message', m.message.uuid, m.message.data);   

                }
            }
        });

        // add listeners for other PubNub events
        this.pubnub.addListener({
            presence: (presenceEvent) => {

                // make sure channel matches this channel
                if(channel == presenceEvent.channel) {

                    // someone joins channel
                    if(presenceEvent.action == "join") {

                        this.emit('join', 
                            presenceEvent.uuid, presenceEvent.state);
                    }

                    // someone leaves channel
                    if(presenceEvent.action == "leave") {
                        this.emit('leave', presenceEvent.uuid);
                    }

                    // someone timesout
                    if(presenceEvent.action == "timeout") {
                        this.emit('timeout', presenceEvent.uuid);
                    }
                    
                    // someone's state is updated
                    if(presenceEvent.action == "state-change") {
                        this.emit('state', 
                            presenceEvent.uuid, presenceEvent.state);
                    }
                       
                }

            }
        });

        // tell PubNub to subscribe to the supplied channel
        this.pubnub.subscribe({ 
            channels: [channel],
            withPresence: true,
            state: state
        });

    }

    publish (data) {

        // publish the given data over PubNub channel
        this.pubnub.publish({
            channel: this.channel,
            message: {
                uuid: this.uuid,
                data: data
            }
        });

    };

    hereNow(cb) {
        
        // ask PubNub for information about connected clients in this channel
        this.pubnub.hereNow({
            channels: [this.channel],
            includeUUIDs: true,
            includeState: true
        }, (status, response) => {

            if(status.error) {
                // if there's a problem with the request log it
                console.error(status, response);
            } else {

                // build a userlist in rltm.js format
                let userList = {};

                // get the list of occupants in this channel
                let occupants = response.channels[this.channel].occupants;

                // format the userList for rltm.js standard
                for(let i in occupants) {
                    userList[occupants[i].uuid] = occupants[i].state;
                }

                // respond with the formatted list
                cb(userList);
            }

        });

    }

    setState(state) {
        
        // use PubNub state function to update state for channel
        this.pubnub.setState({
            state: state,
            uuid: this.uuid,
            channels: [this.channel]
        }, function (status) {
            
            if(status.error) {
                // if there's a problem with the request log it
                console.error(status, response);
            }

        });

    }

    history(cb) {
        
        // retrieved the message history with PubNub
        this.pubnub.history({
            channel: this.channel,
            count: 100 // how many items to fetch
        }, function (status, response) {

            // create our return array
            let data = [];

            // loop through response and push data to array
            for(let i in response.messages) {
                data.push(response.messages[i].entry)
            }

            // reverse the array so newest are first
            data = data.reverse();

            // respond with the history data
            cb(data);

        });

    }

    unsubscribe() {

        // tell PubNub to manually unsubscribe from this channel        
        this.pubnub.unsubscribe({
            channels: [this.channel],
        });

    }
}

// export a generic function expected by rltm.js
module.exports = function(service, config) {

    // convenience method to assign the service string name to itself
    this.service = service;
    
    // set a default uuid if it has not been set for this client
    config.uuid = config.uuid || new Date();

    // initialize PubNub with supplied config information
    let pubnub = new PubNub(config);

    // expose the join method to create new room connections
    this.join = function(channel, state) {
        return new Room(pubnub, channel, config.uuid, state);
    }

    // return the instance of this service
    return this;

};
