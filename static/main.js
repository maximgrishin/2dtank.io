const battleKeyFrame = new Battle();
const battleAnimationFrame = new BattleDrawable();

const socket = io();

let emitInputIntervalId = 0;
let requestAnimationFrameId = 0;
socket.on('sync', (syncPacket) => {
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

  clearInterval(emitInputIntervalId);
  emitInputIntervalId = setInterval(emitInput, Battle.KEYFRAME_INTERVAL);

  cancelAnimationFrame(requestAnimationFrameId);
  requestAnimationFrameId = requestAnimationFrame(animation);
});

socket.on('advance', (advancePacket) => {
  advancePacket.connections.forEach((id) => {
    battleKeyFrame.tanks[id] = new Tank(0, 0, 1);
  });

  battleKeyFrame.advancePositions(Battle.KEYFRAME_INTERVAL);

  Object.keys(advancePacket.inputs).forEach((id) => {
    battleKeyFrame.tanks[id].input = advancePacket.inputs[id];
  });

  battleKeyFrame.processShootInput();

  advancePacket.disconnects.forEach((id) => {
    delete battleKeyFrame.tanks[id];
  });

  battleAnimationFrame.syncDrawable(battleKeyFrame);
  lastAnimationFrameTimestamp = performance.now();
});
