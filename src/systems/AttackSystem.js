export class AttackSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {() => void}   onAttack  — callback fired each time an attack lands
   * @param {() => number} getSpeed  — returns current attacks/sec
   */
  constructor(scene, onAttack, getSpeed) {
    this.scene    = scene;
    this.onAttack = onAttack;
    this.getSpeed = getSpeed;
    this._timer   = null;
    this._active  = false;
  }

  start() {
    this._active = true;
    this._schedule();
  }

  stop() {
    this._active = false;
    if (this._timer) { this._timer.remove(false); this._timer = null; }
  }

  _schedule() {
    if (!this._active) return;
    const interval = Math.round(1000 / this.getSpeed());
    this._timer = this.scene.time.delayedCall(interval, () => {
      if (!this._active) return;
      this.onAttack();
      this._schedule(); // reschedule (picks up speed changes dynamically)
    });
  }
}
