import AssetLoader from '../../Loaders/AssetLoader';
import PlayerSprite from "../../Classes/Phaser/PlayerSprite";
import Constraints from "../../Classes/Constraints/Constraints";
import ReticleSprite from "../../Classes/Phaser/ReticleSprite";
import SocketIOConnection from "../../Classes/Connection/SocketIOConnection";
import WeaponPlugin from 'phaser3-weapon-plugin';

export default class MainScene extends Phaser.Scene {
    constructor(game) {
        console.log("MainScene");
        super({ key: 'MainScene'});
        this.game = game;
        this.balancer = {x:0, y:0};
        this.players = {};
        this.playersToUpdate = {};
    }

    preload() {
        // The asset loader
        this.assetLoader = new AssetLoader({ scene: this });

        this.assetLoader.add({
            type: 'spritesheet',
            name: 'testPlayerTexture',
            filePath: 'Assets/Player/officer_shoot_strip.png',
            frameWidth: 38,
            frameHeight: 45
        });

        this.assetLoader.add({
            type: 'image',
            name: 'testReticleTexture',
            filePath: 'Assets/Player/reticle.png'
        });

        this.assetLoader.add({
            type: 'image',
            name: 'testBackground',
            filePath: 'Assets/parallax-space-backgound.png'
        });

        this.assetLoader.add({
            type: 'image',
            name: 'bullet',
            filePath: 'Assets/Player/bullet.png'
        });

        this.load.scenePlugin('WeaponPlugin', WeaponPlugin, 'weaponPlugin', 'weapons');
        console.log(this.weapons);

        this.assetLoader.preload();
    }
    create() {
        this.add.image(300, 400, 'testBackground');
        console.log(this.game);
        this.game.canvas.addEventListener('mousedown', () => {
            this.input.mouse.requestPointerLock();
        });

        this.mainPlayer = new PlayerSprite({scene: this, x: 300, y: 400, texture: 'testPlayerTexture'}).setVisible(false);
        this.reticle = new ReticleSprite({scene: this, x: 300, y: 400, texture: 'testReticleTexture'}).setScale(0.5, 0.5);
        this.weapon = {};
        this.weaponInitialization(this, this.mainPlayer);

        //keys configuration start
        let defaultKeyPreferences = {
            'up': "W",
            'down': "S",
            'left': "A",
            'right': "D",
            'fire': 'pointerdown'
        };
        let moveKeys = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D
        });
        this.mainPlayerKeyloads(defaultKeyPreferences, moveKeys, this.mainPlayer, this.reticle, this);
        //keys configuration end

        this.eventConfiguration(this);
    }

    update() {
        MainScene.playerAndReticleMoveHandlers(this.mainPlayer, this.reticle, this);
        if(this.balancer.prevX !== this.mainPlayer.x || this.balancer.prevY !== this.mainPlayer.y)
            SocketIOConnection.socket.emit('MoveEvent',
                {
                    eventName: "MoveEvent",
                    payload: {
                        eventType: "MovePlayer",
                        x: this.mainPlayer.x,
                        y: this.mainPlayer.y,
                        rotation: this.mainPlayer.rotation
                    }
                }
            );
        this.balancer.prevX = this.mainPlayer.x;
        this.balancer.prevY = this.mainPlayer.Y;

        MainScene.updatePlayers(this.players, this.playersToUpdate, this);
    }

    static destroySprite(sprite, promise){
        source[id].destroy();
        return promise;
    }

    static updatePlayers(source, target){
        const k = 0.05;
        for(let id in source){
            if(!target[id]){
                this.destroySprite(source[id], () => source[id] = null)();
                console.log("try");
                continue;
            }
            let curPlayer = source[id];
            let targetPlayer = target[id].position;
            curPlayer.x += k*(targetPlayer.x - curPlayer.x);
            curPlayer.y += k*(targetPlayer.y - curPlayer.y);
            curPlayer.rotation = targetPlayer.rotation;
        }
    }

    static playerAndReticleMoveHandlers(player, reticle, context){
        Constraints.velocityContraint(player, 200);
        Constraints.constraintReticle(player, reticle, 200);
        MainScene.normalizeCamera(player, reticle, context)
    }

    static normalizeCamera(player, reticle, context){
        // Rotates player to face towards reticle
        player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);

        // Camera follows reticle
        context.cameras.main.startFollow(reticle);

        // Makes reticle move with player
        reticle.body.velocity.x = player.body.velocity.x;
        reticle.body.velocity.y = player.body.velocity.y;
    }

    mainPlayerKeyloads(keyPreferences, moveKeys, player, reticle, context){
        context.input.keyboard.on('keydown_W', function (event) {
            player.body.setVelocityY(-100);
        });
        context.input.keyboard.on('keydown_S', function (event) {
            player.body.setVelocityY(100);
        });
        context.input.keyboard.on('keydown_A', function (event) {
            player.body.setVelocityX(-100);
        });
        context.input.keyboard.on('keydown_D', function (event) {
            player.body.setVelocityX(100);
        });

        // Stops player acceleration on uppress of WASD keys
        context.input.keyboard.on('keyup_W', function (event) {
            if (moveKeys['down'].isUp)
                player.setVelocityY(0);
        });
        context.input.keyboard.on('keyup_S', function (event) {
            if (moveKeys['up'].isUp)
                player.setVelocityY(0);
        });
        context.input.keyboard.on('keyup_A', function (event) {
            if (moveKeys['right'].isUp)
                player.setVelocityX(0);
        });
        context.input.keyboard.on('keyup_D', function (event) {
            if (moveKeys['left'].isUp)
                player.setVelocityX(0);
        });

        context.input.on('pointermove', function (pointer) {
            if (context.input.mouse.locked)
            {
                reticle.x += pointer.movementX;
                reticle.y += pointer.movementY;
            }
        });

        context.input.on('pointerdown', () => {
            SocketIOConnection.socket.emit('FireEvent',  {
                eventName: "FireEvent",
                payload: ''
            });
        });
    }

    eventConfiguration(context){
        SocketIOConnection.socket.on("UPDATE_PLAYERS", (data)=>{
            for(let elem in data){
                let player = data[elem];
                let id = player.id;
                if(!context.players[id]){
                    context.players[id] = new PlayerSprite({scene: context, x: player.position.x, y: player.position.y, texture: 'testPlayerTexture'});
                    context.weaponInitialization(context, context.players[id], id);
                    context.playersToUpdate[id] = player;
                    this.events.emit('PLAYER_CONNECT')
                } else{
                    context.playersToUpdate[id] = player;
                }
            }
        });

        SocketIOConnection.socket.on('FIRE_EVENT', (data) => {
            let id = data.id;
            let p = data.position;
            let dx = Math.cos(p.rotation)*10 + p.x;
            let dy = Math.sin(p.rotation)*10 + p.y;
            console.log(Phaser.Math.Angle.Between(p.x, p.y, dx, dy));
            console.log((dx - p.x) + " " + (dy - p.y));
            let bullet = context.weapon[id].fire();
            console.log(bullet);
        });
    }

    weaponInitialization(context, player, id){
        context.weapon[id] = context.weapons.add(30, 'bullet');
        let weapon = context.weapon[id];
        weapon.debugPhysics = true;
        weapon.bulletKillType = WeaponPlugin.consts.KILL_WORLD_BOUNDS;
        weapon.bulletSpeed = 800;
        weapon.fireRate = 200;
        weapon.bulletAngleOffset = 90;
        weapon.bulletAngleVariance = 3;
        weapon.trackSprite(player, 0, 0, true);
        for(let innerId in context.players){
            if(innerId !== id)
                context.physics.add.collider(weapon.bullets, context.players[innerId], (bullet, target) => {
                    //Bullet processing here
                    console.log(bullet);
                    console.log(target);
                })
        }
    }
}
