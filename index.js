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
  joins: [],
  inputs: [],
  disconnects: []
};

io.on('connection', (socket) => {
  const id = socket.id;
  socket.on('join', (nick) => {
    if (nick === '') {
      nick = 'unnamed';
    }
    console.log(`${nick} joined`);
    io.pending.syncRequests.push(id);
    io.pending.joins.push({ id, nick });
  });

  socket.on('input', (input) => {
    io.pending.inputs.push({ id, input });
  });

  socket.on('disconnect', () => {
    io.pending.disconnects.push(id);
  });
});

const battle = new Battle();
setInterval(() => {
  const advancePacket = {
    joins: [],
    inputs: [],
    respawns: [],
    disconnects: []
  }

  for (let i = io.pending.joins.length - 1; i >= 0; i--) {
    const id = io.pending.joins[i].id;
    const nick = io.pending.joins[i].nick;
    const x = (Math.random() - 1/2) * (Battle.WIDTH - Tank.HULL_RADIUS);
    const y = (Math.random() - 1/2) * (Battle.HEIGHT - Tank.HULL_RADIUS);
    const hullAngle = (Math.random() * 2 - 1) * Math.PI;
    battle.tanks[id] = new Tank(x, y, hullAngle, nick);
    advancePacket.joins.push({ id, nick, x, y, hullAngle });
  }
  io.pending.joins.splice(0, advancePacket.joins.length);

  Object.keys(battle.respawns).forEach((id) => {
    battle.respawns[id] -= Battle.KEYFRAME_INTERVAL;
    if (battle.respawns[id] <= 0) {
      const x = (Math.random() - 1/2) * (Battle.WIDTH - Tank.HULL_RADIUS);
      const y = (Math.random() - 1/2) * (Battle.HEIGTH - Tank.HULL_RADIUS);
      const hullAngle = (Math.random() * 2 - 1) * Math.PI;
      battle.tanks[id].respawn(x, y, hullAngle);
      advancePacket.respawns.push({ id, x, y, hullAngle });
      delete battle.respawns[id];
    }
  });

  battle.advancePositions(Battle.KEYFRAME_INTERVAL);

  for (let i = io.pending.inputs.length - 1; i >= 0; i--) {
    const id = io.pending.inputs[i].id;
    const input = io.pending.inputs[i].input;
    if (typeof battle.tanks[id] !== 'undefined') {
      battle.tanks[id].input = input;
      advancePacket.inputs.push({ id, input });
    }
  }
  io.pending.inputs.splice(0, advancePacket.inputs.length);

  battle.processShootInput();

  for (let i = io.pending.disconnects.length - 1; i >= 0; i--) {
    const id = io.pending.disconnects[i];
    delete battle.tanks[id];
    advancePacket.disconnects.push(id);
  }
  io.pending.disconnects.splice(0, advancePacket.disconnects.length);

  Object.keys(battle.tanks).forEach((id) => {
    if (io.pending.syncRequests.indexOf(id) === -1) {
      io.to(id).emit('advance', advancePacket);
    }
    else {
      io.to(id).emit('sync', battle);
      io.pending.syncRequests.splice(io.pending.syncRequests.indexOf(id), 1);
    }
  });
}, Battle.KEYFRAME_INTERVAL);
