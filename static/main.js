const battleKeyFrame = new Battle();
const battleAnimationFrame = new BattleDrawable();

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
socket.on('sync', (syncPacket) => {
  document.body.style.cursor = 'crosshair';
  document.getElementsByClassName('welcome page')[0].style.display = 'none';
  document.getElementsByClassName('battle page')[0].style.display = 'inline';
  canvas.style.display = 'inline';
  battleKeyFrame.sync(syncPacket);
  battleAnimationFrame.syncDrawable(syncPacket);
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
  advancePacket.connectionPairs.forEach((pair) => {
		const id = pair.id;
    const nick = pair.nick;
    battleKeyFrame.tanks[id] = new Tank(0, 0, 1);
		battleKeyFrame.tanks[id].nick = nick;
  });

  battleKeyFrame.advancePositions(Battle.KEYFRAME_INTERVAL);

	advancePacket.inputPairs.forEach((inputPair) => {
		const id = inputPair.id;
    const input = inputPair.input;
		if (typeof battleKeyFrame.tanks[id] !== 'undefined') {
      battleKeyFrame.tanks[id].input = input;
		}
  });

  battleKeyFrame.processShootInput();

  advancePacket.disconnects.forEach((id) => {
    delete battleKeyFrame.tanks[id];
  });

  battleAnimationFrame.syncDrawable(battleKeyFrame);
  lastAnimationFrameTimestamp = performance.now();

	battleAnimationFrame.leaderboard = [];
	Object.keys(battleKeyFrame.tanks).forEach((id) => {
		battleAnimationFrame.leaderboard.push({
			nick: battleKeyFrame.tanks[id].nick,
			kills: battleKeyFrame.tanks[id].kills,
			deaths: battleKeyFrame.tanks[id].deaths,
			id
		});
	});
	battleAnimationFrame.leaderboard.sort((a, b) => {
		if (a.kills !== b.kills) {
			return b.kills - a.kills;
		} else {
			return a.deaths - b.deaths;
		}
	});
});
