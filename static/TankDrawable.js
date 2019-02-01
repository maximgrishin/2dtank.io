class TankDrawable extends Tank {
  constructor(x, y, hullAngle) {
    super(x, y, hullAngle);

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
        'M 8,0 v 0.5 q 0,1 -1,1 h -3 q -1,0 -1,1 t -1,1 h -4 q -2,0 -2,-2 v -1.5 ' +
        // left part
        'M 8,0 v -0.5 q 0,-1 -1,-1 h -3 q -1,-0 -1,-1 t -1,-1 h -4 q -2,-0 -2,2 v 1.5'
      ),
      turretInsides: new Path2D(
        'M -4,1.5 h 1 q 1,0 1,1 v 1 ' + // right arc
        'M -4,-1.5 h 1 q 1,0 1,-1 v -1 ' + // left arc
        // lines
        'M 2,3.5 v -7 ' +
        'M 3,2.5 v -5 ' +
        'M 3,1.5 h 1 ' +
        'M 3,-1.5 h 1'
      ),
    }
  }

  draw(id) {
    ctx.save();

    ctx.translate(this.position.x, this.position.y);
    ctx.scale(Tank.RADIUS / 5.5, Tank.RADIUS / 5.5);
    ctx.lineWidth = Tank.RADIUS / 80;

    if (typeof battleAnimationFrame.effects.hits[id] !== 'undefined') {
      ctx.shadowBlur = battleAnimationFrame.effects.hits[id];
      ctx.shadowColor = 'rgba(220, 120, 100, 1)';
      battleAnimationFrame.effects.hits[id]--;
      if (battleAnimationFrame.effects.hits[id] <= 0)
        delete battleAnimationFrame.effects.hits[id];
    }

    ctx.rotate(this.position.hullAngle);
    ctx.fillStyle = 'rgba(150, 150, 150, 1)';
    ctx.strokeStyle = 'rgba(100, 100, 100, 1)';
    ctx.fill(this.paths2D.tracks);
    ctx.stroke(this.paths2D.tracks);
    ctx.fillStyle = (id == socket.id) ? 'rgba(120, 120, 220, 1)' : 'rgba(220, 100, 100, 1)';
    ctx.strokeStyle = (id == socket.id) ? 'rgba(70, 70, 170, 1)' : 'rgba(150, 50, 50, 1)';
    ctx.fill(this.paths2D.hull);
    ctx.stroke(this.paths2D.hull);
    ctx.stroke(this.paths2D.armor);

    ctx.rotate(this.position.turretAngle - this.position.hullAngle);
    ctx.translate((1 - this.load / Tank.FULL_LOAD) * -0.75, 0);
    ctx.fillStyle = (id == socket.id) ? 'rgba(100, 100, 200, 1)' : 'rgba(200, 100, 100, 1)';
    ctx.strokeStyle = (id == socket.id) ? 'rgba(50, 50, 150, 1)' : 'rgba(120, 40, 40, 1)';
    ctx.fill(this.paths2D.turretBorder);
    ctx.stroke(this.paths2D.turretBorder);
    ctx.stroke(this.paths2D.turretInsides);

    ctx.restore();
  }
}
