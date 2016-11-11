"use strict";


let map = (channel, config) => {

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
