"use strict";
const EventEmitter = require('events');

let map = (service, config) => {

    let io = require('socket.io-client');

    this.service = service;

    config.uuid = config.uuid || new Date();
    config.state = config.state || {};

    let endpoint = config.endpoint;

    class Socket extends EventEmitter {
        constructor(channel) {

            super();

            this.channel = channel;

            this.socket = io.connect(endpoint, {multiplex: true})

            this.socket.on('connect', () => {
                this.socket.emit('channel', channel, config.uuid, config.state);
                this.emit('ready');
            });

            this.socket.on('join', (uuid, state) => {
                this.emit('join', uuid, state);
            });

            this.socket.on('leave', (uuid) => {
                this.emit('leave', uuid);
            });

            this.socket.on('message', (uuid, data) => {
                this.emit('message', uuid, data);
            });

            this.socket.on('state', (uuid, state) => {
                this.emit('state', uuid, state);
            });

        }
        publish(data) {
            this.socket.emit('publish', this.channel, config.uuid, data);
        }
        hereNow(cb) {
            
            this.socket.emit('whosonline', this.channel, null, function(users) {
              cb(users);
            });

        }
        setState (state) {
            this.socket.emit('setState', this.channel, config.uuid, state);
        }
        history(cb) {
                        
            this.socket.emit('history', this.channel, null, function(data) {
              cb(data);
            });

        }
        unsubscribe(cb) {
            this.socket.off('message');
        }
    }

    this.join = (channel) => {
        return new Socket(channel);
    };

    return this;

};

module.exports = map;
