"use strict";

let PubNub = require('pubnub');

let map = (channel, config) => {

    // initialize RLTM with pubnub keys
    this.pubnub = new PubNub(config);

    let readyFired = false; 

    let onReady = () => {};
    let onJoin = () => {};
    let onLeave = () => {};
    let onTimeout = () => {};

    this.ready = (fn) => {
        onReady = fn;
    };

    this.join = (fn) => {
        onJoin = fn;
    }

    this.leave = (fn) => {
        onLeave = fn;
    }

    this.timeout = (fn) => {
        onTimeout = fn;
    }

    this.subscribe = (fn) => {

        this.pubnub.addListener({

            status: (statusEvent) => {

                if (statusEvent.category === "PNConnectedCategory") {
                    
                    if(!readyFired) {
                        onReady();
                        readyFired = true;   
                    }

                }

            },
            message: (m) => {
                fn(m.message);
            }
        });

        this.pubnub.subscribe({ 
            channels: [channel],
            withPresence: true
        });

    };

    this.publish = (message) => {
        
        this.pubnub.publish({
            channel: channel,
            message: message
        });

    };

    this.pubnub.addListener({
        presence: (presenceEvent) => {

            if(presenceEvent.action == "join") {
                onJoin(presenceEvent.uuid, presenceEvent.state);
            }
            if(presenceEvent.action == "leave") {
                onLeave(presenceEvent.uuid);
            }
            if(presenceEvent.action == "timeout") {
                onTimeout(presenceEvent.uuid);
            }
            if(presenceEvent.action == "state-change") {

                if(this.users[presenceEvent.uuid]) {
                    this.users[presenceEvent.uuid].update(presenceEvent.state);
                } else {
                    this.userJoin(presenceEvent.uuid, presenceEvent.state, presenceEvent);
                }

            }

        }
    });

    return this;

};

module.exports = map;
