"use strict";

let PubNub = require('pubnub');

let map = (service, config) => {

    this.service = service;

    // initialize RLTM with pubnub keys
    let pubnub = new PubNub(config);

    class Socket {
        constructor(channel) {

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

                pubnub.addListener({

                    status: (statusEvent) => {

                        if (statusEvent.category === "PNConnectedCategory" && statusEvent.affectedChannels.indexOf(channel) > -1) {
                            console.log('its this channel')
                            onReady();
                        }

                    },
                    message: (m) => {
                        fn(m.message.uuid, m.message.data);
                    }
                });

                pubnub.subscribe({ 
                    channels: [channel],
                    withPresence: true
                });

            };

            this.publish = (data) => {

                pubnub.publish({
                    channel: channel,
                    message: {
                        uuid: config.uuid,
                        data: data
                    }
                });

            };

            this.hereNow = (cb) => {
                
                pubnub.hereNow({
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
                
                pubnub.setState(
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
                
                pubnub.history({
                    channel: channel,
                    reverse: true, // Setting to true will traverse the time line in reverse starting with the oldest message first.
                    count: 100 // how many items to fetch
                }, function (status, response) {

                    console.log(status, response)

                    var data = [];
                    for(var i in response.messages) {
                        data.push(response.messages[i].entry)
                    }

                    cb(data);

                });

            }

            this.unsubscribe = () => {
                
                pubnub.unsubscribe({
                    channels: [channel],
                });

            }

            pubnub.addListener({
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

        }
    }

    this.subscribe = function(channel) {
        var s = new Socket(channel);
        console.log(s)
        return s;
    }

    return this;

};

module.exports = map;
