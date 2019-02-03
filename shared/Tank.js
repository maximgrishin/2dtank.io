class Tank {
  static get HULL_SPEED() { return 250; }
  static get HULL_HP() { return 100; }
  static get HULL_RADIUS() { return 45; }
  static get HULL_ROTATION_RADIUS() { return 100; }
  // HULL_ROTATION_SPEED === HULL_SPEED / HULL_ROTATION_RADIUS
  static get TURRET_SPEED() { return 3.5; }
  static get TURRET_LOAD() { return 1500; }
  static get TURRET_DAMAGE() { return 25; }
  static get RESPAWN_TIME() { return 2000; }

  constructor(x, y, hullAngle, nick) {
    this.position = {
      x,
      y,
      hullAngle,
      turretAngle: hullAngle
    }
    this.nick = nick;
    this.load = Tank.TURRET_LOAD;
    this.input = new Input();
    this.hp = Tank.HULL_HP;
    this.kills = 0;
    this.deaths = 0;
    this.respawning = 0;
  }

  sync(tankJSON) {
    Object.assign(this, tankJSON);
  }

  advance(dt) {
    const dr = Tank.HULL_SPEED * dt / 1000;
    const radius = Tank.HULL_ROTATION_RADIUS;
    let dHullAngle = 0;
    if ((this.input.right && this.input.forward) || (this.input.left && this.input.backward)) {
      dHullAngle = dr / radius;
    } else if ((this.input.left && this.input.forward) || (this.input.right && this.input.backward)) {
      dHullAngle = -dr / radius;
    }

    let x = this.position.x;
    let y = this.position.y;
    let hullAngle = this.position.hullAngle;
    if (this.input.right + this.input.left === 1) {
      const sign = this.input.right ? 1 : -1;
      x += sign * radius * (Math.sin(hullAngle + dHullAngle) - Math.sin(hullAngle));
      y += sign * radius * (Math.cos(hullAngle) - Math.cos(hullAngle + dHullAngle));
    } else if (this.input.forward + this.input.backward === 1) {
      const sign = this.input.forward ? 1 : -1;
      x += sign * dr * Math.cos(hullAngle);
      y += sign * dr * Math.sin(hullAngle);
    }
    hullAngle += dHullAngle;

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

    this.position = { x, y, hullAngle, turretAngle };

    if (this.load < Tank.TURRET_LOAD) {
      this.load += dt;
    }
    if (this.load > Tank.TURRET_LOAD) {
      this.load = Tank.TURRET_LOAD;
    }
  }

  shoot() {
    if (this.input.shoot && this.load === Tank.TURRET_LOAD) {
      this.load = 0;
      return true;
    }
    return false;
  }

  respawn(x, y, hullAngle) {
    this.hp = Tank.HULL_HP;
    this.position.x = x;
    this.position.y = y;
    this.position.hullAngle = hullAngle;
  }
}

if (typeof module !== 'undefined') module.exports = Tank;
