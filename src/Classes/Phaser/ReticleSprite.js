import Game from "../../index";

export default class ReticleSprite extends Phaser.Physics.Arcade.Sprite {
    constructor(options){
        super(options.scene, options.x, options.y, options.texture);
        this.scene = options.scene;
        this.game = options.game;
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);
        this.setCollideWorldBounds(true);
    }
}