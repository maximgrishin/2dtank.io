const input = new Input();

const emitInput = () => {
  socket.emit('input', input);
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
    case "KeyJ":
      input.turretLeft = true;
      break;
    case "KeyK":
      input.turretRight = true;
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
    case "KeyJ":
      input.turretLeft = false;
      break;
    case "KeyK":
      input.turretRight = false;
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
}
