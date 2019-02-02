const express = require('express');
const app = express();

const path = require('path');

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'shared')));
app.get((req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

const http = require('http');
const server = http.createServer(app);

const port = process.env.PORT || 1234;
server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

const io = require('socket.io')(server);

global.Input = require(path.join(__dirname, 'shared', 'Input.js'));
global.Tank = require(path.join(__dirname, 'shared', 'Tank.js'));
const Battle = require(path.join(__dirname, 'shared', 'Battle.js'));

process.on('uncaughtException', (error) => {
   console.log(error);
});

//
// GAME LOGIC PART
//

io.pending = {
  syncRequests: [],
  connectionPairs: [],
  inputPairs: [],
  disconnects: []
};

io.on('connection', (socket) => {
  socket.on('join', (nick) => {
    console.log(`${nick} joined`);
    io.pending.syncRequests.push(socket.id);
    io.pending.connectionPairs.push({
      nick,
      id: socket.id
    });
  });

  socket.on('input', (input) => {
    io.pending.inputPairs.push({
      input,
      id: socket.id
    });
  });

  socket.on('disconnect', () => {
    io.pending.disconnects.push(socket.id);
  });
});

const battle = new Battle();

const advanceInterval = setInterval(() => {
  const advancePacket = {
    connectionPairs: [],
    inputPairs: [],
    disconnects: []
  };

  for (let i = io.pending.connectionPairs.length - 1; i >= 0; i--) {
    const id = io.pending.connectionPairs[i].id;
    const nick = io.pending.connectionPairs[i].nick;
    battle.tanks[id] = new Tank(0, 0, 1);
    battle.tanks[id].nick = nick;
    advancePacket.connectionPairs.push({id, nick});
  }
  io.pending.connectionPairs.splice(0, advancePacket.connectionPairs.length);

  battle.advancePositions(Battle.KEYFRAME_INTERVAL);

  for (let i = io.pending.inputPairs.length - 1; i >= 0; i--) {
    const id = io.pending.inputPairs[i].id;
    const input = io.pending.inputPairs[i].input;
    if (typeof battle.tanks[id] !== 'undefined') {
      battle.tanks[id].input = input;
    }
    advancePacket.inputPairs.push({id, input});
  }
  io.pending.inputPairs.splice(0, advancePacket.inputPairs.length);

  battle.processShootInput(Battle.KEYFRAME_INTERVAL);

  for (let i = io.pending.disconnects.length - 1; i >= 0; i--) {
    const id = io.pending.disconnects[i];
    delete battle.tanks[id];
    advancePacket.disconnects.push(id);
  }
  io.pending.disconnects.splice(0, advancePacket.disconnects.length);

  Object.keys(battle.tanks).forEach((id) => {
    if (io.pending.syncRequests.indexOf(id) === -1) {
      io.to(id).emit('advance', {
        connectionPairs: advancePacket.connectionPairs,
        inputPairs: advancePacket.inputPairs,
        disconnects: advancePacket.disconnects
      });
    }
    else {
      io.to(id).emit('sync', battle);
      io.pending.syncRequests.splice(io.pending.syncRequests.indexOf(id), 1);
    }
  });
}, Battle.KEYFRAME_INTERVAL);
