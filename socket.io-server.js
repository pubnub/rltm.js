// require socket.io module
const port = 9000;

const io = require('socket.io')(port);

// stores user states per room
const states = {};

// stores published messages per room
const history = {};

// saves state to ```states``` variable
const saveState = function(channel, uuid, state) {

  // since this is per channel, create channel object if doesn't exist
  if(!states[channel]) {
    states[channel] = {};
  }

  // save state to the channel based on user uuid
  states[channel][uuid] = state;

  // return given state
  return state;

}

// saves published messages to ```history``` variable
const saveHistory = function(channel, uuid, data) {

  // create an array for this channel if it doesn't exist
  if(!history[channel]) {
    history[channel] = [];
  }

  // push the newest uuid and data to the front of the array
  history[channel].unshift({uuid: uuid, data: data});

  // if we have more than 100 messages for this channel, remove the first
  if(history[channel].length > 100) {
    history[channel].pop();
  }

  // return the entire history
  return history[channel];

}

let socketChannels = {};

// when a new rltm.js user connects
io.on('connection', function (socket) {
  
  // when the user calls rltm.join() this is called
  socket.on('channel', function (channel, uuid, state) {

    // have the socket join the channel
    socket.join(channel);

    // save the initial state sent with the user
    saveState(channel, uuid, state);

    // send the 'join' event to everyone else in the channel
    io.to(channel).emit('join', channel, uuid, state);

    socketChannels[socket.id] = socketChannels[socket.id] || [];

    socketChannels[socket.id].push({
      channel: channel,
      uuid: uuid
    });

  });

  // user sets the state
  socket.on('setState', function (channel, uuid, state, fn) {

    // save the set state into the server memory
    saveState(channel, uuid, state);

    // tell all other users state was set
    io.to(channel).emit('state', channel, uuid, state);

    fn();

  });

  // user emits a message
  socket.on('publish', function (channel, uuid, data, fn) {

    // save the message to the history array in memory
    saveHistory(channel, uuid, data);

    // tell all other users of the new message
    io.to(channel).emit('message', channel, uuid, data);

    fn();

  });

  // user wants to know whos online
  socket.on('whosonline', function (channel, data, fn) {

    // respond with what we know about the current users for this channel
    if(!states[channel]) {
      fn({});
    } else {
      fn(states[channel]); 
    }

  });
  
  // user wants the history for this channel
  socket.on('history', function (channel, fn) {

    // respond with history array if it exists
    if(!history[channel]) {
      fn([]);
    } else {
      fn(history[channel]); 
    }

  });

  // user disconnects manually
  socket.on('leave', function(uuid, channel, fn) {

    if (states[channel] && states[channel][uuid]) {
      delete states[channel][uuid];
    }

    // call tell socket.io to disconnect
    socket.leave(channel);
    fn();

  });

  socket.on('disconnect', function() {

    socketChannels[socket.id].forEach(function(data) {
    
      if (states[data.channel] && states[data.channel][data.uuid]) {
        delete states[data.channel][data.uuid];
      }

      io.to(data.channel).emit('disconnect', data.channel, data.uuid);

    });

  });

});

console.log('rltm.js - socket.io server running on port', port)
