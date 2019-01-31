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
  disconnects: [],
  inputs: {}
};

io.on('connection', (socket) => {
  io.pending.connections.push(socket.id);

  socket.on('disconnect', () => {
    const index = io.pending.connections.indexOf(socket.id);
    if (index !== -1) {
      // in case player connected and disconnected before the same keyframe
      // just remove the record from the pending connections list
      io.pending.connections.splice(connectionIndex, 1);
    }
    else {
      io.pending.disconnects.push(socket.id);
    }
  });

  socket.on('input', (input) => {
    io.pending.inputs[socket.id] = input;
  });
});

const battle = new Battle();

const advanceInterval = setInterval(() => {
  io.pending.connections.forEach(id => {
    battle.tanks[id] = new Tank(0, 0, 1);
  });

  io.pending.disconnects.forEach(id => {
    delete battle.tanks[id];
  });

  battle.advancePositions(Battle.KEYFRAME_INTERVAL);

  Object.keys(io.pending.inputs).forEach((id) => {
    if (typeof battle.tanks[id] !== 'undefined') {
      battle.tanks[id].input = io.pending.inputs[id];
    }
  });

  battle.processShootInput(Battle.KEYFRAME_INTERVAL);

  Object.keys(battle.tanks).forEach((id) => {
    if (io.pending.connections.indexOf(id) === -1) {
      try {
        io.sockets.sockets[id].emit('advance', {
          connections: io.pending.connections,
          disconnects: io.pending.disconnects,
          inputs: io.pending.inputs
        });
      } catch (e) {
        if (e.name === 'TypeError') {
          delete battle.tanks[id];
          io.pending.disconnects.push(id);
        }
      }
    }
    else {
      io.sockets.sockets[id].emit('sync', battle);
    }
  });

  io.pending.connections = [];
  io.pending.disconnects = [];
  io.pending.inputs = {};
}, Battle.KEYFRAME_INTERVAL);
