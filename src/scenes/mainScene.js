const MAX_VEL_X = 700;

import CharacterController from "../utils/characterController.js";
import { CombinedKeys } from "../utils/utils.js";

function configurePlatform(pl) {
    pl.body.checkCollision.down = false;
    pl.body.checkCollision.left = false;
    pl.body.checkCollision.right = false;
    pl.setAlpha(0.7);
}

class MainScene extends Phaser.Scene {
    constructor() {
        super({key: "MainScene", active: true});
    }

    preload() {
        this.load.setBaseURL('./');

        this.load.svg('sky', 'assets/a_Sky.svg');
        // this.load.svg('star', 'assets/a_Star.svg');
        this.load.svg('ground', 'assets/a_Ground.svg');
        this.load.spritesheet('dude', 
            'assets/dude.svg',
            { frameWidth: 64, frameHeight: 96 }
        );
    }

    create() {
        this.add.image(400, 300, 'sky');
        // this.add.image(400, 300, 'star');

        var platforms = this.physics.add.staticGroup();
    
        platforms.create(400, 568, 'ground').setScale(3, 1).refreshBody();
    
        configurePlatform(platforms.create(600, 350, 'ground'));
        configurePlatform(platforms.create(50, 200, 'ground'));
        configurePlatform(platforms.create(750, 170, 'ground'));

        this._ball = this.add.circle(300, 300, 10, 0xff9900);
        this.physics.add.existing(this._ball);
        this._ball.body.collideWorldBounds = true;
        this._ball.body.setBounce(0.75, 0.75);
        this._ball.body.maxVelocity.y = 2000;
        // this._ball.body.isCircle = true;
        this._ball._throwTime = 0;

        this._player = this.physics.add.sprite(100, 450, 'dude').setScale(0.5, 0.5).refreshBody();
        this._playersBall = this.add.circle(100, 450, 10, 0xff9900);
        this._playersBall.setVisible(false);
        this._player.setBodySize(45, 90);

        this._actionKeys = new CombinedKeys(this.input.keyboard.addKeys("E,SPACE,ENTER,SHIFT"));
        this._controller = new CharacterController(
            this._player,
            this.input.keyboard.addKeys("A,LEFT"),
            this.input.keyboard.addKeys("D,RIGHT"),
            this.input.keyboard.addKeys("W,UP")
        );

        this._player.setBounce(0.0);
        this._player.setCollideWorldBounds(true);
        this._player.body.maxVelocity.x = MAX_VEL_X;
    
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
    
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'jumpRight',
            frames: [ { key: 'dude', frame: 5 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'jumpLeft',
            frames: [ { key: 'dude', frame: 3 } ],
            frameRate: 20
        });
    
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    
        this.physics.add.collider(this._player, platforms);
        this.physics.add.collider(this._ball, platforms);
        this.physics.add.overlap(this._player, this._ball, () => {
            if (this.time.now > this._ball._throwTime + 250) {
                this._ball.body.setEnable(false);
                this._ball.setVisible(false);
                this._playersBall.setVisible(true);
            }
        });
        this.events.on('postupdate', () => { this._playersBall.setPosition(this._player.x, this._player.y); });

        this.add.text(10, 10, 'Arrows/WSAD to run & jump\nSHIFT/SPACE/ENTER/E to throw the ball').setTint(0);
    }

    update() {
        this._controller.update(this.time.now);
        if (this._actionKeys.isDown()) {
            if (!this._ball.visible) {
                this._ball._throwTime = this.time.now;
                this._ball.setPosition(this._playersBall.x, this._playersBall.y);
                this._ball.setVisible(true);
                this._playersBall.setVisible(false);
                this._ball.body.setEnable(true);
                this._ball.body.velocity.set(
                    1.5 * this._player.body.velocity.x,
                    0.25 * this._player.body.velocity.y - 1600,
                );
            }
        }
    }
};

export default MainScene;
