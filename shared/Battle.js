class Battle {
  static get KEYFRAME_INTERVAL() { return 200; }

  constructor() {
    this.tanks = {};
  }

  sync(syncPacket) {
    this.tanks = {};
    Object.keys(syncPacket.tanks).forEach((id) => {
      this.tanks[id] = new Tank();
      this.tanks[id].sync(syncPacket.tanks[id]);
    });
  }

  advancePositions(dt) {
    Object.keys(this.tanks).forEach((id) => {
      this.tanks[id].advance(dt);
    });
  }

  processShootInput() {
    Object.keys(this.tanks).forEach((id) => {
      const tank = this.tanks[id];
      if (tank.shoot()) {
        Object.keys(this.tanks).forEach((enemyId) => {
          const enemyTank = this.tanks[enemyId];
          if (enemyId !== id) {
            const alpha = tank.position.turretAngle;
            const x1 = tank.position.x;
            const y1 = tank.position.y;
            const x2 = enemyTank.position.x;
            const y2 = enemyTank.position.y;
            const d = Math.abs((y2 - y1) * Math.cos(alpha) - (x2 - x1) * Math.sin(alpha));
            if (d <= Tank.RADIUS) {
              enemyTank.hp -= Tank.TURRET_DAMAGE;
              if (enemyTank.hp <= 0) {
                enemyTank.position.x = 0;
                enemyTank.position.y = 0;
                enemyTank.hp = Tank.FULL_HP;
              }
              if (typeof battleAnimationFrame !== 'undefined') {
                battleAnimationFrame.effects.hits[enemyId] = Tank.TURRET_DAMAGE;
              }
            }
          }
        });
      }
    });
  }
}

if (typeof module !== 'undefined') module.exports = Battle;
