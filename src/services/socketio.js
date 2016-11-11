"use strict";


let map = (service, channel, config) => {

    this.service = service;
    // initialize RLTM with pubnub keys

    let endpoint = config.endpoint + '/' + channel;

    this.socket = require('socket.io-client')(endpoint);

    let readyFired = false;

    let onReady = () => {};
    let onJoin = () => {};
    let onLeave = () => {};
    let onTimeout = () => {};
    let onSubscribe = () => {};
    let onMessage = () => {};
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

    this.setState = (state) => {
        this.socket.emit('setState', config.uuid, state);
    }

    this.subscribe = (fn) => {

        onSubscribe = fn;

        if(!readyFired) {

            this.socket.emit('start', config.uuid, config.state);   
            onReady();
            readyFired = true;
        }

    };

    this.publish = (data) => {
        this.socket.emit('publish', config.uuid, data);
    };

    this.hereNow = (cb) => {
        
        this.socket.emit('whosonline', null, function(users) {
          cb(users);
        });

    }

    this.history = (cb) => {
        
        this.socket.emit('history', null, function(data) {
          cb(data);
        });

    }

    this.unsubscribe = (cb) => {
        this.socket.removeAllListeners(channel);
    }

    this.socket.on('connect', () => {
    });

    this.socket.on('join', (uuid, state) => {
        onJoin(uuid, state);
    });

    this.socket.on('leave', (uuid) => {
        onLeave(uuid);
    });

    this.socket.on('message', (uuid, data) => {
        onSubscribe(uuid, data);
    });

    this.socket.on('state', (uuid, state) => {
        onState(uuid, state);
    });

    return this;

};

module.exports = map;
