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

    this.publish = (message) => {
        this.socket.emit('publish', message);
    };


    this.hereNow = (cb) => {
        
        this.socket.emit('whosonline', null, function(users) {
          cb(users);
        });

    }

    this.socket.on('connect', () => {
    });

    this.socket.on('join', (data) => {
        onJoin(data);
    });

    this.socket.on('leave', (data) => {
        onLeave(data);
    });

    this.socket.on('message', (data) => {
        onSubscribe(data);
    });

    this.socket.on('state', (data) => {
        onState(data);
    });

    return this;

};

module.exports = map;

// socket.emit('subscribe', {
//     room: 'a-new-room',
//     uuid: new Date().getTime(),
//     state: {
//         hello: 'world'
//     }
// });

// setInterval(function(){

// }, 5000);
