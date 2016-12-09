"use strict";

// include NodeJS event emitter
const EventEmitter = require('events');

// include the Socket.io client library
const io = require('socket.io-client');

// represents a connection to a single channel
class Room extends EventEmitter {

    constructor(endpoint, channel, uuid, state) {

        // call the EventEmitter constructor
        super();

        // store this clients uuid
        this.uuid = uuid;

        // assign the channel parameter as a property
        this.channel = channel;

        this.isReady = false;

        // create a connection to the socketio endpoint
        this.socket = io.connect(endpoint, {multiplex: true});

        // subscribe to the socket.io connection event
        this.socket.on('connect', () => {

            // tell the server that we want to join a channel
            this.socket.emit('channel', channel, this.uuid, state);

            // tell the client the server is ready
            this.onReady();
            this.isReady = true;

        });

        // server says someone has joined
        this.socket.on('join', (channel, uuid, state) => {

            // make sure the channel is this channel
            if(this.channel == channel) {

                // emit the 'join' event to the client
                this.emit('join', uuid, state);

            }

        });

        // server says someone has left
        this.socket.on('leave', (channel, uuid) => {

            // make sure it's on this channel
            if(this.channel == channel) {

                // emit the 'leave' event to the client
                this.emit('leave', uuid);
            }

        });

        // a message is sent from the srever
        this.socket.on('message', (channel, uuid, data) => {

            // make sure it is on this channel
            if(this.channel == channel) {

                // tell the client of the new message
                this.emit('message', uuid, data);
            }

        });

        // a client sets their state
        this.socket.on('state', (channel, uuid, state) => {

            // make sure it is on this channel
            if(this.channel == channel) {

                // tell the client of the set state
                this.emit('state', uuid, state);
            }

        });

    }
    ready(fn) {
        
        this.onReady = fn;
        
        if(this.isReady) {
            this.onReady();
        }

    }
    onReady() {
        // waiting to be assigned by client
        return;
    }
    publish(data) {

        // publish the data to the socket.io server
        this.socket.emit('publish', this.channel, this.uuid, data);

    }
    hereNow(cb) {
        
        // ask socket.io-server for a list of online users
        this.socket.emit('whosonline', this.channel, null, function(users) {

            // callback with an object of users
            cb(users);

        });

    }
    setState (state) {

        // tell socket.io-server to update this user's state
        this.socket.emit('setState', this.channel, this.uuid, state);

    }
    history(cb) {
                    
        // ask socket.io-server for the history of messages published
        this.socket.emit('history', this.channel, null, function(data) {
            
            // callback with an array of messages
            cb(data);

        });

    }
    unsubscribe(channel, cb) {

        // manually disconnect from socket.io-server
        this.socket.emit('leave', this.uuid, channel);

    }
    
}

module.exports = function (setup) {

    // convenience method to assign the service string name to itself
    this.service = setup.service;

    this.join = (channel, state) => {
        return new Room(config.endpoint, channel, setup.config.uuid, setup.config.state);
    };

    return this;

};
