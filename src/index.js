import Phaser from 'phaser';
import MenuScene from './Scenes/MenuScene';
import BootScene from './Scenes/BootScene'
import MainScene from "./Scenes/Game/MainScene";


let config = {
  type: Phaser.AUTO,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  width: 800,
  height: 600,
  pixelArt: false,
  debug:true
};

export default class Game extends Phaser.Game{
  constructor() {
    // The Game
    super(config);

    //this.sys.install('WeaponPlugin');
    this.scene.add('MenuScene', new MenuScene());
    this.scene.add('BootScene', new BootScene());
    this.scene.add('MainScene', new MainScene(this));
    this.scene.start('MenuScene');

  }
}

new Game();