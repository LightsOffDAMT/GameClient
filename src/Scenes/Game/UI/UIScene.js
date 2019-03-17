export default class UIScene extends Phaser.Scene {
    constructor(scene) {
        console.log("UIScene");
        super({key: 'UIScene', active: true});
    }
    create(){
        let text = this.add.text(10, 10, "Connected " + "0" + " player(s)");
        let cnt = 0;
        let mainScene = this.scene.get('MainScene').events;
        mainScene.on('PLAYER_CONNECT', ()=> text.setText("Connected " + (++cnt) + " player(s)"));
        mainScene.on('PLAYER_DISCONNECT', ()=> text.setText("Connected " + (--cnt) + " player(s)"));
    }

}