console.log('starting socket io server')

var io = require('socket.io')(8000);

var users = {};

let channel = 'test-channel';

let room = io.of(channel);

let messageHistory = [];

room.on('connection', function (socket) {
  
  // when the client emits 'subscribe', this listens and executes
  socket.on('start', function (uuid, state) {

    // statetore user in object
    users[uuid] = state;

    socket.uuid = uuid;
    socket.state = state;

    // echo globally (all clients) that a person has connected
    room.emit('join', uuid, state);

  });
  
  socket.on('setState', function (uuid, state) {
    
    users[uuid] = state;

    room.emit('state', uuid, state);    

  });

  // when the client emits 'add user', this listens and executes
  socket.on('publish', function (uuid, data, fn) {
    
    io.of(channel).emit('message', uuid, data);

    messageHistory.unshift({uuid: uuid, data: data});
    if(messageHistory.length > 100) {
      messageHistory.pop();
    }

  });

  socket.on('whosonline', function (data, fn) {

    // callback with user data
    fn(users);

  });
  
  // 
  socket.on('history', function (data, fn) {
    fn(messageHistory);
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {

    delete users[socket.uuid];

    // echo globally that this client has left
    socket.broadcast.emit('leave', socket.uuid);

  });


});
