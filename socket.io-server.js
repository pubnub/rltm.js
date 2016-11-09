var io = require('socket.io')(8000);

var users = {};

io.on('connection', function (socket) {
  
  // when the client emits 'add user', this listens and executes
  socket.on('subscribe', function (data) {

    // store user in object
    users[data.uuid] = data.state;

    socket.uuid = data.uuid;
    socket.state = data.state;
    
    // echo globally (all clients) that a person has connected
    io.sockets.emit('join', data);

  });

  // when the client emits 'add user', this listens and executes
  socket.on('whosonline', function (data, fn) {

    // callback with user data
    fn(users);

  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {

    delete users[socket.uuid];

    // echo globally that this client has left
    socket.broadcast.emit('leave', {
      state: socket.state,
      uuid: socket.uuid
    });

  });


});
