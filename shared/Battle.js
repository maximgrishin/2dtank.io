class Battle {
  static get KEYFRAME_INTERVAL() { return 200; }
  static get WIDTH() { return 1000; }
  static get HEIGHT() { return 1000; }

  constructor() {
    this.tanks = {};
    this.respawns = {};
  }

  sync(battleJSON) {
    this.tanks = {};
    Object.keys(battleJSON.tanks).forEach((id) => {
      this.tanks[id] = new Tank();
      this.tanks[id].sync(battleJSON.tanks[id]);
    });
  }

  advancePositions(dt) {
    const sortedTankIds = Object.keys(this.tanks).sort();
    sortedTankIds.forEach((id) => {
      if (this.tanks[id].hp > 0) {
        this.tanks[id].advance(dt);
      }
    });
    sortedTankIds.forEach((id) => {
      sortedTankIds.forEach((enemyId) => {
        const position = this.tanks[id].position;
        const enemyPosition = this.tanks[enemyId].position;
        const dx = position.x - enemyPosition.x;
        const dy = position.y - enemyPosition.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        const collisionDistance = 2*Tank.HULL_RADIUS;
        if (distance < collisionDistance) {
          if (distance == 0) {
            position.y += collisionDistance/2;
            enemyPosition.y -= collisionDistance/2;
          }
          else {
            position.x += dx*(collisionDistance/distance - 1)/2;
            enemyPosition.x -= dx*(collisionDistance/distance - 1)/2;
            position.y += dy*(collisionDistance/distance - 1)/2;
            enemyPosition.y -= dy*(collisionDistance/distance - 1)/2;
          }
        }
      });
    });
    sortedTankIds.forEach((id) => {
      const position = this.tanks[id].position;
      if (position.x > Battle.WIDTH/2 - Tank.HULL_RADIUS) {
        position.x = Battle.WIDTH/2 - Tank.HULL_RADIUS;
      }
      if (position.x < -Battle.WIDTH/2 + Tank.HULL_RADIUS) {
        position.x = -Battle.WIDTH/2 + Tank.HULL_RADIUS;
      }
      if (position.y > Battle.HEIGHT/2 - Tank.HULL_RADIUS) {
        position.y = Battle.HEIGHT/2 - Tank.HULL_RADIUS;
      }
      if (position.y < -Battle.HEIGHT/2 + Tank.HULL_RADIUS) {
        position.y = -Battle.HEIGHT/2 + Tank.HULL_RADIUS;
      }
    });
  }

  processShootInput() {
    Object.keys(this.tanks).forEach((id) => {
      const tank = this.tanks[id];
      if (tank.hp > 0 && tank.shoot()) {
        Object.keys(this.tanks).forEach((enemyId) => {
          const enemyTank = this.tanks[enemyId];
          if (enemyTank.hp > 0 && enemyId !== id) {
            const alpha = tank.position.turretAngle;
            const x1 = tank.position.x;
            const y1 = tank.position.y;
            const x2 = enemyTank.position.x;
            const y2 = enemyTank.position.y;
            const d = Math.abs((y2 - y1) * Math.cos(alpha) - (x2 - x1) * Math.sin(alpha));
            if (d <= Tank.HULL_RADIUS) {
              enemyTank.hp -= Tank.TURRET_DAMAGE;
              if (enemyTank.hp <= 0) {
                enemyTank.deaths++;
                tank.kills++;
                if (typeof module !== 'undefined') {
                  this.respawns[enemyId] = Tank.RESPAWN_TIME;
                }
              }
              if (typeof module === 'undefined') {
                battleDrawable.effects.hits[enemyId] = 25;
              }
            }
          }
        });
      }
    });
  }
}

if (typeof module !== 'undefined') module.exports = Battle;
