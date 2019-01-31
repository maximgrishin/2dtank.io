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
  connections: [],
  inputs: {},
  disconnects: []
};

io.on('connection', (socket) => {
  io.pending.connections.push(socket.id);

  socket.on('input', (input) => {
    io.pending.inputs[socket.id] = input;
  });

  socket.on('disconnect', () => {
    io.pending.disconnects.push(socket.id);
  });
});

const battle = new Battle();

const advanceInterval = setInterval(() => {
  const advancePacket = {
    connections: [],
    inputs: {},
    disconnects: []
  };

  for (let i = io.pending.connections.length - 1; i >= 0; i--) {
    const id = io.pending.connections[i];
    battle.tanks[id] = new Tank(0, 0, 1);
    advancePacket.connections.push(id);
    io.pending.connections.splice(i, 1);
  }

  battle.advancePositions(Battle.KEYFRAME_INTERVAL);

  Object.keys(io.pending.inputs).forEach((id) => {
    battle.tanks[id].input = io.pending.inputs[id];
    advancePacket.inputs[id] = io.pending.inputs[id];
    delete io.pending.inputs[id];
  });

  battle.processShootInput(Battle.KEYFRAME_INTERVAL);

  for (let i = io.pending.disconnects.length - 1; i >= 0; i--) {
    const id = io.pending.disconnects[i];
    delete battle.tanks[id];
    advancePacket.disconnects.push(id);
    io.pending.disconnects.splice(i, 1);
  }

  Object.keys(battle.tanks).forEach((id) => {
    if (advancePacket.connections.indexOf(id) === -1) {
      io.sockets.sockets[id].emit('advance', {
        connections: advancePacket.connections,
        inputs: advancePacket.inputs,
        disconnects: advancePacket.disconnects
      });
    }
    else {
      io.sockets.sockets[id].emit('sync', battle);
    }
  });
}, Battle.KEYFRAME_INTERVAL);
