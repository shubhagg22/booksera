var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var players = {};
var playerLen=0;
var star = {
  x: Math.floor(Math.random() * 1500) + 100,
  y: Math.floor(Math.random() * 650) + 100
};
var scores = {
  blue: 0,
  red: 0
};
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('a user connected');
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    team: (playerLen)%2 ? 'blue' : 'red'
  };
  playerLen+=1;
  socket.emit('currentPlayers', players);
  socket.emit('starLocation', star);
  socket.emit('scoreUpdate', scores);
  socket.broadcast.emit('newPlayer', players[socket.id]);
  socket.on('disconnect', function () {
    console.log('user disconnected');
    delete players[socket.id];
    playerLen-=1;
    io.emit('disconnected', socket.id);
  });
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });
  socket.on('starCollected', function () {
  if (players[socket.id].team === 'red') {
    scores.red += 10;
  } else {
    scores.blue += 10;
  }
  star.x = Math.floor(Math.random() * 700) + 50;
  star.y = Math.floor(Math.random() * 500) + 50;
  io.emit('starLocation', star);
  io.emit('scoreUpdate', scores);
});
});
server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
