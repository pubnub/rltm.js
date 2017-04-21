"use strict";

// include the NodeJS event emitter
const EventEmitter = require('events');

// include the Ably javascript sdk
const Ably = require('ably');

// represents a connection to a single channel
class Room extends EventEmitter {
    constructor(ably, channel, state) {
        // call the EventEmitter constructor
        super();

        // determine the user's state
        state = state || {};

        // assign the channel parameter as a property
        this.channelName = channel;
        this.channel = ably.channels.get(channel);

        // save Ably in the instance of room
        this.ably = ably;

        this.isReady = false;

        // use the Ably library to listen for messages
        this.channel.once('attached', () => {
            // tell the user that first connection made
            this.onReady();
        });

        this.channel.subscribe((message) => {
            // emit the message as an event
            this.emit('message', message.id, message.data);
        });

        this.channel.presence.subscribe((presenceEvent) => {
            if((presenceEvent.action === 'enter') || (presenceEvent.action === 'sync')) {
                this.emit('join',
                    presenceEvent.clientId, presenceEvent.data);
            }

            // someone leaves channel
            if(presenceEvent.action === 'leave') {
                this.emit('leave', presenceEvent.clientId);
            }

            // timeout event is not supported in Ably
            // this.emit('disconnect', presenceEvent.uuid);

            // someone's state is updated
            if(presenceEvent.action === 'update') {
                this.emit('state',
                    presenceEvent.clientId, presenceEvent.data);
            }
        });

        // explicitly attach to the channel, although it will implicilty be attached by calling subscribe above
        this.channel.attach();

        // enter the channel room automatically and be present
        this.channel.presence.enter();
    }

    onReady() {
        // waiting to be assigned by user
        return;
    }

    ready(fn) {
        this.onReady = fn;
    }

    message(data) {
        return new Promise((resolve, reject) => {
            // publish the given data over the Ably channel
            this.channel.publish(null, data);
        }, (err) => {
            if(err) {
                // if there's a problem publishing, reject
                reject(err);
            } else {
                resolve();
            }
        });
    }

    here() {
        return new Promise((resolve, reject) => {
            // ask Ably for information about members presence on this channel
            this.channel.presence.get((err, members) => {
                if(err) {
                    // if there's a problem with the get request, reject
                    reject(err)
                } else {
                    // build a userlist in rltm.js format
                    let userList = {};

                    // format the userList for rltm.js standard
                    for(let i in members) {
                        userList[members[i].clientId] = members[i].data;
                    }

                    // respond with formatted list
                    resolve(userList);
                }
            });
        });
    }

    state(state) {
        return new Promise((resolve, reject) => {
            // Update presence state
            this.channel.presence.update(state, (err) => {
                if(err) {
                    // if there's a problem with the update request, reject
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    history() {
        return new Promise((resolve, reject) => {
            // retrieved the message history
            this.channel.history({ count: 100 }, (err, page) => {
                if(err) {
                    // if there's a problem with the history request, reject
                    reject(err);
                } else {
                    // create our return array
                    let data = [];

                    // loop through response and push data to array
                    for(let i in page.items) {
                        data.push({
                            uuid: page.items[i].clientId,
                            data: page.items[i].data
                        });
                    }

                    // respond with the history data
                    resolve(data);
                }
            });
        });
    }

    leave() {
        return new Promise((resolve, reject) => {
            // tell Ably to complete leave and detach from this channel
            this.channel.detach((err) => {
                if(err) {
                    // if there's a problem detaching, reject
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

// export a generic function expected by rltm.js
module.exports = function(setup) {
    // convenience method to assign the service string name to itself
    this.service = setup.service;

    // initialize Ably with supplied config information
    let ably = new Ably.Realtime(setup.config);

    // clientId may be assigned from the token issued to the client so
    // only assign once the client has connected
    ably.connection.once('connected', () => {
        setup.config.uuid = ably.auth.clientId;
    });

    this.ably = ably;

    // expose the join method to create new room connections
    this.join = (channel, state) => {
        return new Room(this.ably, channel, state);
    }

    // return the instance of this service
    return this;

};
