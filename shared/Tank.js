class Tank {
  static get HULL_SPEED() { return 200; }
  static get TURRET_SPEED() { return 2; }
  static get FULL_LOAD() { return 1000; }
  static get RADIUS() { return 40; }

  constructor(x, y, hullAngle) {
    this.position = {
      x,
      y,
      hullAngle,
      turretAngle: hullAngle
    }
    this.load = Tank.FULL_LOAD;
    this.input = new Input();
  }

  sync(syncPacketTank) {
    Object.assign(this, syncPacketTank);
  }

  predictPosition(dt) {
    const dr = Tank.HULL_SPEED * dt / 1000;
    let y = this.position.y;
    if (this.input.forward) {
      y -= dr;
    }
    if (this.input.backward) {
      y += dr;
    }
    let x = this.position.x;
    if (this.input.left) {
      x -= dr;
    }
    if (this.input.right) {
      x += dr;
    }

    let hullAngle = this.position.hullAngle;

    const dTurretAngle = Tank.TURRET_SPEED * dt / 1000;
    let turretAngle = this.position.turretAngle;
    const diff = this.input.turretAngle - this.position.turretAngle;
    if (diff >= 2 * Math.PI - dTurretAngle || diff <= -2 * Math.PI + dTurretAngle) {
      turretAngle = this.input.turretAngle;
    } else if (diff < -Math.PI) {
      turretAngle += dTurretAngle;
    } else if (diff > Math.PI) {
      turretAngle -= dTurretAngle;
    } else if (diff > dTurretAngle) {
      turretAngle += dTurretAngle;
    } else if (diff < -dTurretAngle) {
      turretAngle -= dTurretAngle;
    } else {
      turretAngle = this.input.turretAngle;
    }
    if (turretAngle > Math.PI) {
      turretAngle -= 2 * Math.PI;
    } else if (turretAngle < -Math.PI) {
      turretAngle += 2 * Math.PI;
    }

    return { x, y, hullAngle, turretAngle };
  }

  advance(dt) {
    this.position = this.predictPosition(dt);
    if (this.load < Tank.FULL_LOAD) {
      this.load += dt;
      if (this.load > Tank.FULL_LOAD) {
        this.load = Tank.FULL_LOAD;
      }
    }
  }

  shoot() {
    if (this.input.shoot && this.load === Tank.FULL_LOAD) {
      this.load = 0;
      return true;
    }
    return false;
  }
}

if (typeof module !== 'undefined') module.exports = Tank;
