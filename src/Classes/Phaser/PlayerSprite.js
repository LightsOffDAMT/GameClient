/**
 * A custom PlayerSprite class extending Phaser's sprite class.
 *
 * Necessary arguments:
 *  scene - The scene the sprite is contained in
 *  x - X position of the sprite
 *  y - Y position of the sprite
 *  texture - The name of the sprite (the sprite's key.)
 *
 */
import Game from "../../index";

export default class PlayerSprite extends Phaser.Physics.Arcade.Sprite {
  constructor(options, anims) {
    super(options.scene, options.x, options.y, options.texture);
    this.scene = options.scene;
    this.game = options.game;
    console.log("New player");
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);

    this.setCollideWorldBounds(true);

    if(PlayerSprite.requiredAnimations(anims))
      this.animations = this.scene.anims.create(anims);
    else {
      console.log("Bad message: not all required animations founded, all animations will be ignored");
    }

  }

  updatePosition(newPosition){
    let prevPosition = {x: this.x, y: this.y, rotation: this.rotation};
    if(PlayerSprite.equals(prevPosition, newPosition))
      this.animations.stop('walk');
    else
      this.animations.start('walk');
    this.x = x;
    this.y = y;
    this.rotation = rotation;
  }

  static requiredAnimations(anims){
    return anims != null || anims !== undefined;
  }

  static equals(source, dest){
    let eps = 1e-2;
    return !!(PlayerSprite.equalsWithEps(source.x, dest.x, eps) &&
        PlayerSprite.equalsWithEps(source.y, dest.y, eps));
  }

  static equalsWithEps(o1, o2, eps){
    return Math.abs(o2 - o1) < eps;
  }
}
