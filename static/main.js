const battle = new Battle();
const battleDrawable = new BattleDrawable();

const socket = io();

const handleEnter = (event) => {
	if (event.code === 'Enter') {
    socket.emit('join', document.getElementsByClassName('nickname')[0].value);
    removeEventListener("keypress", handleEnter);
  }
};
addEventListener("keypress", handleEnter);

let emitInputIntervalId = 0;
let requestAnimationFrameId = 0;
socket.on('sync', (battleJSON) => {
  document.body.style.cursor = 'crosshair';
  document.getElementsByClassName('welcome page')[0].style.display = 'none';
  document.getElementsByClassName('battle page')[0].style.display = 'inline';
  canvas.style.display = 'inline';
  battle.sync(battleJSON);
  battleDrawable.sync(battleJSON);
  lastAnimationFrameTimestamp = performance.now();

  removeEventListener("keydown", handleKeyDown);
  addEventListener("keydown", handleKeyDown);

  removeEventListener("keyup", handleKeyUp);
  addEventListener("keyup", handleKeyUp);

  removeEventListener("mousemove", handleMouseMove);
  addEventListener("mousemove", handleMouseMove);

  removeEventListener("mousedown", handleMouseDown);
  addEventListener("mousedown", handleMouseDown);

  removeEventListener("mouseup", handleMouseUp);
  addEventListener("mouseup", handleMouseUp);

  clearInterval(emitInputIntervalId);
  emitInputIntervalId = setInterval(emitInput, Battle.KEYFRAME_INTERVAL);

  cancelAnimationFrame(requestAnimationFrameId);
  requestAnimationFrameId = requestAnimationFrame(animation);
});

socket.on('advance', (advancePacket) => {
  advancePacket.joins.forEach((record) => {
    battle.tanks[record.id] = new Tank(record.x, record.y, record.hullAngle, record.nick);
  });

	advancePacket.respawns.forEach((record) => {
    battle.tanks[record.id].respawn(record.x, record.y, record.hullAngle);
  });

  battle.advancePositions(Battle.KEYFRAME_INTERVAL);

	advancePacket.inputs.forEach((record) => {
		const id = record.id;
    const input = record.input;
		if (typeof battle.tanks[id] !== 'undefined') {
      battle.tanks[id].input = input;
		}
  });

  battle.processShootInput();

  advancePacket.disconnects.forEach((id) => {
    delete battle.tanks[id];
  });

  battleDrawable.sync(battle);
  lastAnimationFrameTimestamp = performance.now();

	battleDrawable.leaderboard = [];
	Object.keys(battle.tanks).forEach((id) => {
		battleDrawable.leaderboard.push({
			id,
			nick: battle.tanks[id].nick,
			kills: battle.tanks[id].kills,
			deaths: battle.tanks[id].deaths
		});
	});
	battleDrawable.leaderboard.sort((a, b) => {
		if (a.kills !== b.kills) {
			return b.kills - a.kills;
		} else {
			return a.deaths - b.deaths;
		}
	});
});

const canvas = document.getElementsByTagName('canvas')[0];;
const ctx = canvas.getContext('2d');
let lastAnimationFrameTimestamp = 0;
const animation = (currentTimestamp) => {
  requestAnimationFrameId = requestAnimationFrame(animation);

  battleDrawable.advancePositions(currentTimestamp - lastAnimationFrameTimestamp);
  lastAnimationFrameTimestamp = currentTimestamp;

  canvas.width = innerWidth;
  canvas.height = innerHeight;
  battleDrawable.draw(currentTimestamp);
};
