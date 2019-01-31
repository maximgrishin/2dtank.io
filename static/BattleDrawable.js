class BattleDrawable extends Battle {
  constructor() {
    super();
  }

  syncDrawable(syncPacket) {
    this.tanks = {};
    Object.keys(syncPacket.tanks).forEach((id) => {
      this.tanks[id] = new TankDrawable();
      this.tanks[id].sync(syncPacket.tanks[id]);
    });
  }

  draw() {
    this.drawGrid();
    ctx.translate(innerWidth / 2 - this.tanks[socket.id].position.x, innerHeight / 2 - this.tanks[socket.id].position.y);
    Object.keys(this.tanks).forEach((id) => {
      // draw shooting line
      /*
      ctx.beginPath();
      ctx.moveTo(position.x, position.y);
      ctx.lineTo(position.x + 2000*Math.cos(position.turretAngle), position.y + 2000*Math.sin(position.turretAngle));
      ctx.closePath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = ((tank.load <= Tank.FULL_LOAD / 7) ? 'red' : 'black');
      ctx.stroke();
      */
      this.tanks[id].draw(id);
    });
  }

  drawGrid() {
    const CELL_SIZE = 70;
    ctx.beginPath();
    for (let x = (innerWidth/2 - this.tanks[socket.id].position.x) % CELL_SIZE; x < innerWidth; x += CELL_SIZE) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, innerHeight);
    }
    for (let y = (innerHeight/2 - this.tanks[socket.id].position.y) % CELL_SIZE; y < innerHeight; y += CELL_SIZE) {
      ctx.moveTo(0, y);
      ctx.lineTo(innerWidth, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(234, 234, 234, 1)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}
