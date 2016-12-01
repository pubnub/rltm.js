"use strict";
const EventEmitter = require('events');

let PubNub = require('pubnub');

module.exports = function(service, config) {

    this.service = service;
    
    config.uuid = config.uuid || new Date();

    // initialize RLTM with pubnub keys
    let pubnub = new PubNub(config);

    class Socket extends EventEmitter {
        constructor(channel, state) {

            super();

            this.state = state || {};

            this.channel = channel;

            pubnub.addListener({
                status: (statusEvent) => {

                    if (statusEvent.category === "PNConnectedCategory" && statusEvent.affectedChannels.indexOf(channel) > -1) {
                        this.emit('ready');
                    }

                },
                message: (m) => {

                    if(channel == m.channel) {
                        this.emit('message', m.message.uuid, m.message.data);   
                    }
                }
            });

            pubnub.addListener({
                presence: (presenceEvent) => {

                    if(channel == presenceEvent.channel) {

                        if(presenceEvent.action == "join") {
                            this.emit('join', presenceEvent.uuid, presenceEvent.state);
                        }
                        if(presenceEvent.action == "leave") {
                            this.emit('leave', presenceEvent.uuid);
                        }
                        if(presenceEvent.action == "timeout") {
                            this.emit('timeout', presenceEvent.uuid);
                        }
                        if(presenceEvent.action == "state-change") {
                            this.emit('state', presenceEvent.uuid, presenceEvent.state);
                        }
                           
                    }

                }
            });

            pubnub.subscribe({ 
                channels: [channel],
                withPresence: true,
                state: state
            });

        }

        publish (data) {

            pubnub.publish({
                channel: this.channel,
                message: {
                    uuid: config.uuid,
                    data: data
                }
            });

        };

        hereNow(cb) {
            
            pubnub.hereNow({
                channels: [this.channel],
                includeUUIDs: true,
                includeState: true
            }, (status, response) => {

                if(!status.error) {

                    var userList = {};
                    
                    for(var i in response.channels[this.channel].occupants) {
                        userList[response.channels[this.channel].occupants[i].uuid] = response.channels[this.channel].occupants[i].state;
                    }

                    cb(userList);

                } else {
                    console.log(status, response);
                }

            });

        }

        setState(state) {
            
            pubnub.setState(
                {
                    state: state,
                    uuid: config.uuid,
                    channels: [this.channel]
                },
                function (status) {
                    // handle state setting response
                }
            );

        }

        history(cb) {
            
            pubnub.history({
                channel: this.channel,
                count: 100 // how many items to fetch
            }, function (status, response) {

                var data = [];
                for(var i in response.messages) {
                    data.push(response.messages[i].entry)
                }

                data = data.reverse();

                cb(data);

            });

        }

        unsubscribe() {
            
            pubnub.unsubscribe({
                channels: [this.channel],
            });

        }
    }

    this.join = function(channel, state) {
        return new Socket(channel, state);
    }

    return this;

};
