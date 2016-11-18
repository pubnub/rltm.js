"use strict";
let io = require('socket.io-client');

let map = (service, config) => {

    this.service = service;

    let endpoint = config.endpoint;

    class Socket {
        constructor(channel) {

            this.socket = io.connect(endpoint + '/' + channel, {multiplex: true})

            this.onReady = () => {};
            this.onJoin = () => {};
            this.onLeave = () => {};
            this.onTimeout = () => {};
            this.onState = () => {};
            this.onMessage = () => {};

            this.ready = (fn) => {
                this.onReady = fn;
            };

            this.join = (fn) => {
                this.onJoin = fn;
            }

            this.leave = (fn) => {
                this.onLeave = fn;
            }

            this.timeout = (fn) => {
                this.onTimeout = fn;
            }

            this.state = (fn) => {
                this.onState = fn;
            }

            this.message = (fn) => {
                this.onMessage = fn;
            }

            this.socket.on('connect', () => {
                this.onReady();
                this.socket.emit('start', config.uuid, config.state);   

            });

            this.socket.on('join', (uuid, state) => {
                this.onJoin(uuid, state);
            });

            this.socket.on('leave', (uuid) => {
                this.onLeave(uuid);
            });

            this.socket.on('message', (uuid, data) => {
                this.onMessage(uuid, data);
            });

            this.socket.on('state', (uuid, state) => {
                this.onState(uuid, state);
            });

            this.publish = (data) => {
                this.socket.emit('publish', config.uuid, data);
            };

            this.hereNow = (cb) => {
                
                this.socket.emit('whosonline', null, function(users) {
                  cb(users);
                });

            }

            this.setState = (state) => {
                this.socket.emit('setState', config.uuid, state);
            }

            this.history = (cb) => {
                
                this.socket.emit('history', null, function(data) {
                  cb(data);
                });

            }

            this.unsubscribe = (cb) => {
                this.socket.off('message');
            }

        }
    }

    this.subscribe = (channel) => {

        console.log('new socket', endpoint + '/' + channel)
        return new Socket(channel);

    };

    return this;

};

module.exports = map;
