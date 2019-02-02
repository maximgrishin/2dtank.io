const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let lastAnimationFrameTimestamp = 0;
const animation = (currentTimestamp => {
  requestAnimationFrameId = requestAnimationFrame(animation);

  battleAnimationFrame.advancePositions(currentTimestamp - lastAnimationFrameTimestamp);
  lastAnimationFrameTimestamp = currentTimestamp;

  canvas.width = innerWidth;
  canvas.height = innerHeight;
  battleAnimationFrame.draw();
});
