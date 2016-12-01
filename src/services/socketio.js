"use strict";
const EventEmitter = require('events');

module.exports = function (service, config) {

    let io = require('socket.io-client');

    this.service = service;

    config.uuid = config.uuid || new Date().getTime();
    config.state = config.state || {};

    let endpoint = config.endpoint;

    class Socket extends EventEmitter {
        constructor(channel) {

            super();

            this.channel = channel;

            this.socket = io.connect(endpoint, {multiplex: true});

            this.socket.on('connect', () => {
                this.socket.emit('channel', channel, config.uuid, config.state);
                this.emit('ready');
            });

            this.socket.on('join', (channel, uuid, state) => {

                if(this.channel == channel) {
                    this.emit('join', uuid, state);   
                }
            });

            this.socket.on('leave', (channel, uuid) => {
                if(this.channel == channel) {
                    this.emit('leave', uuid);
                }
            });

            this.socket.on('message', (channel, uuid, data) => {
                if(this.channel == channel) {
                    this.emit('message', uuid, data);
                }
            });

            this.socket.on('state', (channel, uuid, state) => {
                if(this.channel == channel) {
                    this.emit('state', uuid, state);
                }
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
        unsubscribe(channel, cb) {
            this.socket.emit('leave', config.uuid, channel);
        }
        
    }

    this.join = (channel) => {
        return new Socket(channel);
    };

    return this;

};
