import AssetLoader from '../Loaders/AssetLoader';

export default class MenuScene extends Phaser.Scene {
  constructor(options) {
    super({ key: 'MenuScene' });
  }
  preload() {
    // The asset loader
    this.assetLoader = new AssetLoader({ scene: this });
    this.assetLoader.add({type: "image", name: "testAsset", filePath: "Assets/Menu/start_button.png"});
    //
    // Any other components go here...
    //

    // Load the assets
    this.assetLoader.preload();
  }
  create() {
    let button = this.add.image(400, 300, "testAsset");
    console.log(button.width + " " + button.height);
    let buttonShape = Phaser.Geom.Rectangle(button.x, button.y, button.width, button.height);
    button.setInteractive(buttonShape, Phaser.Geom.Rectangle.Contains);
    button.on('pointerover', function () {

      button.setTint(0x7878ff);

    });

    button.on('pointerout', function () {

      button.clearTint();

    });

    button.on('pointerdown', () => {
      this.scene.start('BootScene');
    });
  }
  update() {}
}
