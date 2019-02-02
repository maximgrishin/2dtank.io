class BattleDrawable extends Battle {
  constructor() {
    super();

    this.effects = {
      hits: {}
    };

    this.leaderBoard = [];
  }

  syncDrawable(syncPacket) {
    this.tanks = {};
    Object.keys(syncPacket.tanks).forEach((id) => {
      this.tanks[id] = new TankDrawable();
      this.tanks[id].sync(syncPacket.tanks[id]);
    });
  }

  draw() {
    ctx.beginPath();
    ctx.rect(0, 0, innerWidth, innerHeight);
    ctx.closePath();
    ctx.fillStyle = 'rgba(234, 234, 234, 1)';
    ctx.fill();

    ctx.save();
    ctx.translate(innerWidth / 2 - this.tanks[socket.id].position.x, innerHeight / 2 - this.tanks[socket.id].position.y);

    ctx.beginPath();
    ctx.rect(-Battle.WIDTH/2, -Battle.HEIGHT/2, Battle.WIDTH, Battle.HEIGHT);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fill();

    ctx.restore();

    this.drawGrid();
    this.drawTanks();
    this.drawHealthBar();
    this.drawLoadBar();
    ctx.font = 'bold 12px serif';

    ctx.fillStyle = 'black';
    ctx.fillText('Kills', innerWidth - 125, 20);
    ctx.fillText('Deaths', innerWidth - 80, 20);
    ctx.fillText('Leaderboard', innerWidth - 300, 20);
    let position = 1;
    battleAnimationFrame.leaderboard.forEach((line) => {
      if (line.id === socket.id) {
        ctx.fillStyle = 'blue';
      } else {
        ctx.fillStyle = 'black';
      }
      ctx.fillText(`${position}. ${line.nick}`, innerWidth - 300, 20 * (1.5 + position));
      ctx.textAlign = 'right';
      ctx.fillText(`${line.kills}`, innerWidth - 100, 20 * (1.5 + position));
      ctx.textAlign = 'left';
      ctx.fillText(`${line.deaths}`, innerWidth - 80, 20 * (1.5 + position));
      position++;
    });
    //ctx.fillText(`${position}. ${line.nick}: ${line.kills}/${line.deaths}`, innerWidth - 120, 20 * (1));

  }

  drawGrid() {
    const CELL_SIZE = 250;
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

  drawTanks() {
    ctx.save();
    ctx.translate(innerWidth / 2 - this.tanks[socket.id].position.x, innerHeight / 2 - this.tanks[socket.id].position.y);
    Object.keys(this.tanks).forEach((id) => {
      // draw shooting line for debugging
      /*const position = this.tanks[id].position;
      const tank = this.tanks[id];
      ctx.beginPath();
      ctx.moveTo(position.x, position.y);
      ctx.lineTo(position.x + 2000*Math.cos(position.turretAngle), position.y + 2000*Math.sin(position.turretAngle));
      ctx.closePath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = ((tank.load <= Tank.FULL_LOAD / 7) ? 'rgba(255, 0, 0, 1)' : 'rgba(100, 100, 100, 0.5)');
      ctx.stroke();
      */
      this.tanks[id].draw(id);
    });
    ctx.restore();
  }

  drawHealthBar() {
    ctx.save();

    ctx.translate(innerWidth / 2, innerHeight / 2 + 70);
    ctx.scale(90, 60);

    ctx.beginPath();
    ctx.arc(0.45, 0, 0.05, -Math.PI/2, Math.PI/2);
    ctx.lineTo(-0.45, 0.05);
    ctx.arc(-0.45, 0, 0.05, Math.PI/2, -Math.PI/2);
    ctx.lineTo(0.45, -0.05);
    ctx.clip();
    ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
    ctx.fill();

    ctx.beginPath();
    ctx.rect(-0.5, -0.05, this.tanks[socket.id].hp / Tank.FULL_HP, 0.1);
    ctx.closePath();
    ctx.fillStyle = 'rgba(50, 234, 100, 0.5)';
    ctx.fill();

    ctx.restore();
  }

  drawLoadBar() {
    ctx.save();

    ctx.translate(innerWidth / 2, innerHeight / 2 + 80);
    ctx.scale(90, 60);

    ctx.beginPath();
    ctx.arc(0.45, 0, 0.05, -Math.PI/2, Math.PI/2);
    ctx.lineTo(-0.45, 0.05);
    ctx.arc(-0.45, 0, 0.05, Math.PI/2, -Math.PI/2);
    ctx.lineTo(0.45, -0.05);
    ctx.clip();
    ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
    ctx.fill();

    ctx.beginPath();
    ctx.rect(-0.5, -0.05, this.tanks[socket.id].load / Tank.FULL_LOAD, 0.1);
    ctx.closePath();
    ctx.fillStyle = 'rgba(50, 50, 255, 0.7)';
    ctx.fill();

    ctx.restore();
  }
}
