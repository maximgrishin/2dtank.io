const input = new Input();
let mouseDown = false;

const emitInput = () => {
  socket.emit('input', input);
  if (mouseDown === false)
    input.shoot = false;
}

const handleKeyDown = (event) => {
  if (event.defaultPrevented) {
    return;
  }
	switch (event.code) {
    case "KeyW":
    case "ArrowUp":
      input.forward = true;
      break;
    case "KeyS":
    case "ArrowDown":
      input.backward = true;
      break;
    case "KeyA":
    case "ArrowLeft":
      input.left = true;
      break;
    case "KeyD":
    case "ArrowRight":
      input.right = true;
      break;
    default:
      return;
	};
  event.preventDefault();
}

const handleKeyUp = (event) => {
  if (event.defaultPrevented) {
    return;
  }
	switch (event.code) {
    case "KeyW":
    case "ArrowUp":
      input.forward = false;
      break;
    case "KeyS":
    case "ArrowDown":
      input.backward = false;
      break;
    case "KeyA":
    case "ArrowLeft":
      input.left = false;
      break;
    case "KeyD":
    case "ArrowRight":
      input.right = false;
      break;
    default:
      return;
	}
  event.preventDefault();
}

const handleMouseMove = (event) => {
  input.turretAngle = Math.atan2(
    event.clientY - innerHeight / 2,
    event.clientX - innerWidth / 2
  );
}

const handleMouseDown = (event) => {
  input.shoot = true;
  mouseDown = true;
}

const handleMouseUp = (event) => {
  mouseDown = false;
}
