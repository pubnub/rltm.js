var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8000);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {

    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var users = {};

io.on('connection', function (socket) {

  socket.emit('news', { hello: 'world' });
  
  socket.on('my other event', function (data) {
    console.log(data);
  });

  // when the client emits 'add user', this listens and executes
  socket.on('join', function (data) {

    // store user in object
    users[data.uuid] = data.state;

    socket.uuid = data.uuid;
    socket.state = data.state;
    
    // echo globally (all clients) that a person has connected
    io.sockets.emit('user joined', data);

  });

  // when the client emits 'add user', this listens and executes
  socket.on('whosonline', function (data, fn) {

    // echo globally (all clients) that a person has connected
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
