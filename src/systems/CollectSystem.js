import { SaveManager } from '../utils/SaveManager.js';

export class CollectSystem {
  /**
   * @param {Phaser.Scene}   scene
   * @param {Phaser.GameObjects.GameObject} playerBody  — physics-enabled object
   * @param {Phaser.GameObjects.GameObject} dogBody
   * @param {FragmentSystem} fragmentSystem
   * @param {() => number}   getPlayerRadius
   * @param {(n:number)=>void} onCollect  — called with count each time fragment(s) collected
   */
  constructor(scene, playerBody, dogBody, fragmentSystem, getPlayerRadius, onCollect) {
    this.scene           = scene;
    this.fragmentSystem  = fragmentSystem;
    this.getPlayerRadius = getPlayerRadius;
    this.onCollect       = onCollect;

    // Overlap for player (circle-based manual check since radius is dynamic)
    scene.physics.add.overlap(playerBody, fragmentSystem.group, (_, frag) => {
      this._collect(frag);
    });

    // Overlap for dog
    scene.physics.add.overlap(dogBody, fragmentSystem.group, (_, frag) => {
      this._collect(frag);
    });
  }

  _collect(frag) {
    if (!frag.active) return;
    frag.setActive(false).setVisible(false);
    SaveManager.addFragments(1);
    this.onCollect(1);
  }
}
