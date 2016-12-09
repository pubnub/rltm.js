// require socket.io module
const io = require('socket.io')(9000);

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

// when a new rltm.js client connects
io.on('connection', function (socket) {
  
  // when the client calls rltm.join() this is called
  socket.on('channel', function (channel, uuid, state) {

    // have the socket join the channel
    socket.join(channel);

    // save the initial state sent with the client
    saveState(channel, uuid, state);

    // send the 'join' event to everyone else in the channel
    io.to(channel).emit('join', channel, uuid, state);

  });

  // client sets the state
  socket.on('setState', function (channel, uuid, state, fn) {

    // save the set state into the server memory
    saveState(channel, uuid, state);

    // tell all other clients state was set
    io.to(channel).emit('state', channel, uuid, state);

    fn();

  });

  // client emits a message
  socket.on('publish', function (channel, uuid, data, fn) {

    // save the message to the history array in memory
    saveHistory(channel, uuid, data);

    // tell all other clients of the new message
    io.to(channel).emit('message', channel, uuid, data);

    fn();

  });

  // client wants to know whos online
  socket.on('whosonline', function (channel, data, fn) {

    // respond with what we know about the current clients for this channel
    if(!states[channel]) {
      fn({});
    } else {
      fn(states[channel]); 
    }

  });
  
  // client wants the history for this channel
  socket.on('history', function (channel, fn) {

    // respond with history array if it exists
    if(!history[channel]) {
      fn([]);
    } else {
      fn(history[channel]); 
    }

  });

  // client disconnects manually
  socket.on('leave', function(uuid, channel, fn) {

    // call tell socket.io to disconnect
    socket.leave(channel);

    fn();

  });


});
