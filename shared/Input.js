class Input {
  constructor() {
	  this.forward = false;
	  this.backward = false;
	  this.left = false;
	  this.right = false;
    this.turretAngle = 0;
    this.shoot = false;
  }
};

if (typeof module !== 'undefined') module.exports = Input;
