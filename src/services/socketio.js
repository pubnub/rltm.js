"use strict";


let map = (channel, config) => {

    // initialize RLTM with pubnub keys

    let endpoint = config + '/' + channel;
    console.log(endpoint);
    
    this.socket = require('socket.io-client')(endpoint);

    let readyFired = false;

    let onReady = () => {};
    let onJoin = () => {};
    let onLeave = () => {};
    let onTimeout = () => {};

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

    };

    this.publish = (message) => {
        
    };

    this.socket.on('connect', () => {
        onReady();
        console.log('connected')
    });

    this.socket.on('join', (data) => {

        console.log('someone joined');
        console.log(data);

        onJoin(data);

    });

    this.socket.on('leave', (data) => {

        console.log('someone left');
        onLeave(data);

    });

    this.socket.on('news', (data) => {
        console.log(data);
        socket.emit('my other event', { my: 'data' });
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

// socket.emit('whosonline', null, function(users) {
  
//   console.log('whos online');
//   console.log(users);

// });

// }, 5000);
