const MAX_VEL_X = 500;

import CharacterController from "../utils/characterController.js";

class MainScene extends Phaser.Scene {
    constructor() {
        super({key: "MainScene", active: true});
    }

    preload() {
        this.load.setBaseURL('./');

        this.load.svg('sky', 'assets/a_Sky.svg');
        this.load.svg('star', 'assets/a_Star.svg');
        this.load.svg('ground', 'assets/a_Ground.svg');
        this.load.spritesheet('dude', 
            'assets/dude.svg',
            { frameWidth: 64, frameHeight: 96 }
        );
    }

    create() {
        this.add.image(400, 300, 'sky');
        this.add.image(400, 300, 'star');

        var platforms = this.physics.add.staticGroup();
    
        platforms.create(400, 568, 'ground').setScale(3, 1).refreshBody();
    
        platforms.create(600, 350, 'ground');
        platforms.create(50, 200, 'ground');
        platforms.create(750, 170, 'ground');

        this._player = this.physics.add.sprite(100, 450, 'dude').setScale(0.5, 0.5).refreshBody();
        this._controller = new CharacterController(
            this._player,
            this.input.keyboard.addKeys("A,LEFT"),
            this.input.keyboard.addKeys("D,RIGHT"),
            this.input.keyboard.addKeys("W,UP,SPACE")
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
    }

    update() {
        this._controller.update(this.time.now);
    }
};

export default MainScene;
