"use strict";

let PubNub = require('pubnub');

let map = (service, channel, config) => {

    this.service = service;

    // initialize RLTM with pubnub keys
    this.pubnub = new PubNub(config);

    let readyFired = false; 

    let onReady = () => {};
    let onJoin = () => {};
    let onLeave = () => {};
    let onTimeout = () => {};
    let onState = () => {};

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

    this.state = (fn) => {
        onState = fn;
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
                fn(m.message.uuid, m.message.data);
            }
        });

        this.pubnub.subscribe({ 
            channels: [channel],
            withPresence: true
        });

    };

    this.publish = (data) => {

        this.pubnub.publish({
            channel: channel,
            message: {
                uuid: config.uuid,
                data: data
            }
        });

    };

    this.hereNow = (cb) => {
        
        this.pubnub.hereNow({
            channels: [channel],
            includeUUIDs: true,
            includeState: true
        }, (status, response) => {

            if(!status.error) {

                var userList = {};
                
                for(var i in response.channels[channel].occupants) {
                    userList[response.channels[channel].occupants[i].uuid] = response.channels[channel].occupants[i].state;
                }

                cb(userList);

            } else {
                console.log(status, response);
            }

        });

    }

    this.setState = (state) => {
        
        this.pubnub.setState(
            {
                state: state,
                uuid: config.uuid,
                channels: [channel]
            },
            function (status) {
                // handle state setting response
            }
        );

    }

    this.history = (cb) => {
        
        this.pubnub.history({
            channel: channel,
            reverse: true, // Setting to true will traverse the time line in reverse starting with the oldest message first.
            count: 100 // how many items to fetch
        }, function (status, response) {

            var data = [];
            for(var i in response.messages) {
                data.push(response.messages[i].entry)
            }

            cb(data);

        });

    }

    this.unsubscribe = () => {
        
        this.pubnub.unsubscribe({
            channels: [channel],
        });

    }

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
                onState(presenceEvent.uuid, presenceEvent.state);
            }

        }
    });

    return this;

};

module.exports = map;
