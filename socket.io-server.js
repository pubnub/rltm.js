var io = require('socket.io')(8000);

var states = {};
var history = {};

var saveState = function(channel, uuid, state) {

  if(!states[channel]) {
    states[channel] = {};
  }
  states[channel][uuid] = state;

  return state;

}

var saveHistory = function(channel, uuid, data) {

  if(!history[channel]) {
    history[channel] = [];
  }

  history[channel].unshift({uuid: uuid, data: data});
  if(history[channel].length > 100) {
    history[channel].pop();
  }

  return history[channel];

}

io.on('connection', function (socket) {
  
  // when the client emits 'subscribe', this listens and executes
  socket.on('channel', function (channel, uuid, state) {

    let room = io.of(channel);
    socket.join(channel);

    saveState(channel, uuid, state);

    io.to(channel).emit('join', channel, uuid, state);
    
    socket.on('setState', function (channel, uuid, state) {

      saveState(channel, uuid, state);
      io.to(channel).emit('state', channel, uuid, state);

    });

  });

  // when the client emits 'add user', this listens and executes
  socket.on('publish', function (channel, uuid, data, fn) {

    saveHistory(channel, uuid, data);
    io.to(channel).emit('message', channel, uuid, data);

  });

  socket.on('whosonline', function (channel, data, fn) {

    if(!states[channel]) {
      fn({});
    } else {
      fn(states[channel]); 
    }

  });
  
  // 
  socket.on('history', function (channel, data, fn) {
    
    if(!history[channel]) {
      fn([]);
    } else {
      fn(history[channel]); 
    }

  });

  // when the user disconnects.. perform this
  socket.on('leave', function(uuid, channel) {
    socket.leave(channel);
  });


});
