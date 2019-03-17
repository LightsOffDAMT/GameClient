import AssetLoader from '../Loaders/AssetLoader';
import MainScene from "./Game/MainScene";
import SocketIOConnection from "../Classes/Connection/SocketIOConnection";

export default class BootScene extends Phaser.Scene {
    constructor(){
        super({key: "BootScene"});
        SocketIOConnection.connect('http://localhost:9000');
    }

    preload(){
        console.log("BootScene");
        this.assetLoader = new AssetLoader({ scene: this });
        this.assetLoader.add({type: "image", name: "loading_image", filePath: "Assets/Loading/loading_image.png"});

        this.assetLoader.preload();
    }

    create(){
        this.text = this.add.text(100, 200, "Loading", { font: '128px Arial', fill: "#047b03"});
        this.loadingImage = this.add.image(400, 400, "loading_image");
        this.loadingImage.opacity = 0.7;
    }

    update(){
        if(this.loadingImage){
            this.loadingImage.rotation += 0.01;
        }
        if(this.text){
            let curRot = this.loadingImage.rotation;
            let adding = "";
            if(curRot > 0.5 && curRot < 1.5)
                adding = ".";
            if(curRot >= 1.5)
                adding = "..";
            if(curRot <= -1)
                adding = "...";
            this.text.setText("Loading" + adding);
        }
        if(SocketIOConnection.connected()){
            this.scene.start('MainScene');
        }
    }
}
