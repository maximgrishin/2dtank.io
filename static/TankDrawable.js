class TankDrawable extends Tank {
  constructor(x, y, hullAngle, nick) {
    super(x, y, hullAngle, nick);

    this.paths2D = {
      tracks: new Path2D(
        // right track
        'M 4,3 h 2 q 0,2 -2,2 z ' + // front part
        'M -4,3 v 2 q -2,0 -2,-2 z ' + // back part
        // left track
        'M 4,-3 v -2 q 2,0 2,2 z ' + // front part
        'M -4,-3 h -2 q 0,-2 2,-2 z'// back part
      ),
      hull: new Path2D(
        'M 6,3 ' +
        'h -2 v 2 h -8 ' + // right border
        'v -2 h -2 v -6 ' + // back border
        'h 2 v -2 h 8 ' + // left border
        'v 2 h 2 v 6 ' + // front border
        'z'
      ),
      armor: new Path2D(
        // right plates
        'M 3,5 v -2 h -6 v 2 ' + // border
        'M 1,3 v 2 M -1,3 v 2 ' + // separation
        // lest plates
        'M 3,-5 v 2 h -6 v -2 ' + // border
        'M 1,-3 v -2 M -1,-3 v -2' // separation
      ),
      turretBorder: new Path2D(
        // right part (going from front to back)
        'M 2,-2 q 2,2 0,4 l 2,2 h -6 q -2,0 -2,-2 ' +
        'v -4 q 0,-2 2,-2 h 6 l -2,2'
      ),
      turretInsides: new Path2D(
        'M 2,-2 h -4 v 4' +
        'M 2,2 h -4'
      )
    }
  }

  draw(id, currentTimestamp) {
    ctx.save();

    ctx.translate(this.position.x, this.position.y);

    if (id !== socket.id) {
      ctx.font = 'bold 15px serif';
      ctx.fillStyle = 'grey';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.nick}`, 0, 80);
    }

    ctx.scale(7, 7);
    ctx.lineWidth = 0.5;

    if (typeof battleDrawable.effects.hits[id] !== 'undefined') {
      ctx.shadowBlur = battleDrawable.effects.hits[id];
      ctx.shadowColor = 'rgba(220, 120, 100, 1)';
      battleDrawable.effects.hits[id]--;
      if (battleDrawable.effects.hits[id] <= 0) {
        delete battleDrawable.effects.hits[id];
      }
    }

    ctx.rotate(this.position.hullAngle);
    if (this.hp <= 0) {
      ctx.fillStyle = '#111';
      ctx.strokeStyle = '#000';
    }
    else {
      ctx.fillStyle = 'rgba(150, 150, 150, 1)';
      ctx.strokeStyle = 'rgba(100, 100, 100, 1)';
    }

    ctx.fill(this.paths2D.tracks);
    ctx.stroke(this.paths2D.tracks);
    if (this.hp <= 0) {
      ctx.fillStyle = '#444';
      ctx.strokeStyle = '#222';
    }
    else {
      ctx.fillStyle = (id === socket.id) ? 'rgba(120, 120, 220, 1)' : 'rgba(220, 100, 100, 1)';
      ctx.strokeStyle = (id === socket.id) ? 'rgba(70, 70, 170, 1)' : 'rgba(150, 50, 50, 1)';
    }
    ctx.fill(this.paths2D.hull);
    ctx.stroke(this.paths2D.hull);
    ctx.stroke(this.paths2D.armor);

    ctx.rotate(this.position.turretAngle - this.position.hullAngle);
    ctx.translate((1 - this.load / Tank.TURRET_LOAD) * -0.75, 0);
    if (this.hp <= 0) {
      ctx.fillStyle = '#333';
      ctx.strokeStyle = '#111';
    }
    else {
      ctx.fillStyle = (id === socket.id) ? 'rgba(100, 100, 200, 1)' : 'rgba(200, 100, 100, 1)';
      ctx.strokeStyle = (id === socket.id) ? 'rgba(50, 50, 150, 1)' : 'rgba(120, 40, 40, 1)';
    }
    ctx.fill(this.paths2D.turretBorder);
    ctx.stroke(this.paths2D.turretBorder);
    ctx.stroke(this.paths2D.turretInsides);



  	const R_MAX = 30;
  	const step = 4;
  	const an = -1;

    for (let r = (currentTimestamp / 70) % step + 3; r < R_MAX; r += step) {
      //if ((currentTimestamp - beginTimestamp - r) >= 0) {
        //if (currentTimestamp - endTimestamp - r <= 0) {
          ctx.beginPath();
          ctx.arc(0, 0, r, -Math.PI/4, Math.PI/4);

          ctx.shadowBlur = 5;
          ctx.shadowColor=(id === socket.id) ? 'rgba(100, 100, 200, 1)' : 'rgba(200, 100, 100, 1)';
          ctx.strokeStyle = (id === socket.id) ? `rgba(100, 100, 200, ${(R_MAX - r)/R_MAX})` : `rgba(200, 100, 100, ${(R_MAX - r)/R_MAX})`;

          ctx.stroke();
        //}
      //}
    }

    ctx.restore();
  }
}
