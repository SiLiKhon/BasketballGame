const MAX_VEL_X = 500;
const MIN_VEL_X = 50;
const ACC_X = 1500;
const FRICTION = 20;
const JUMP_MERCY = 120;
const JUMP_DELAY = 250;
const JUMP_POSTLAND_DELAY = 120;

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

        this._player = this.physics.add.sprite(100, 450, 'dude').setScale(0.5, 0.5).refreshBody();;

        this._player.setBounce(0.0);
        this._player.setCollideWorldBounds(true);
        this._player.body.maxVelocity.x = MAX_VEL_X;
        this._player.jumpTimer = 0;
        this._player.landingTimer = 0;
        this._player.lastOnFloorTime = this.time.now;
    
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
    
        this._cursors = this.input.keyboard.createCursorKeys();
        this._jumpButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this._aButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this._dButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this._wButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    }

    update() {
        if (this._player.body.onFloor()) {
            this._player.lastOnFloorTime = this.time.now;
        } else if (this.time.now - this._player.lastOnFloorTime > JUMP_MERCY) {
            this._player.landingTimer = this.time.now;
        }
        if (
            !this._cursors.left.isDown
            && !this._cursors.right.isDown
            && !this._aButton.isDown
            && !this._dButton.isDown
        ) {
            this._player.setAccelerationX(0);

            if (this._player.body.onFloor()) {
                this._player.anims.play('turn');
                if (Math.abs(this._player.body.velocity.x) > MIN_VEL_X) {
                    this._player.setAccelerationX(-FRICTION * this._player.body.velocity.x);
                } else {
                    this._player.setVelocityX(0);
                }
            }
        } else {
            var abs_acc = this._player.body.onFloor() ? ACC_X : 0.25 * ACC_X;
            if (this._cursors.left.isDown || this._aButton.isDown) {
                if (this._player.body.onFloor()) this._player.anims.play('left', true);
                this._player.setAccelerationX(-abs_acc);
                if (Math.abs(this._player.body.velocity.x) < MIN_VEL_X) this._player.body.velocity.x = -MIN_VEL_X;
            } else if (this._cursors.right.isDown || this._dButton.isDown) {
                if (this._player.body.onFloor()) this._player.anims.play('right', true);
                this._player.setAccelerationX(abs_acc);
                if (Math.abs(this._player.body.velocity.x) < MIN_VEL_X) this._player.body.velocity.x = MIN_VEL_X;
            }
            if (this._player.body.onFloor() && this._player.body.velocity.x * this._player.body.acceleration.x < 0) {
                var friction_dec = -FRICTION * this._player.body.velocity.x;
                if (Math.abs(friction_dec) > Math.abs(this._player.body.acceleration.x)) {
                    this._player.setAccelerationX(friction_dec);
                }
            }
        }

        if (
            (this._cursors.up.isDown || this._jumpButton.isDown || this._wButton.isDown)
            && this._player.jumpTimer < this.time.now
            && this.time.now - this._player.lastOnFloorTime < JUMP_MERCY
            && this.time.now - this._player.landingTimer > JUMP_POSTLAND_DELAY
        ) {
            this._player.setVelocityY(-1200);
            this._player.jumpTimer = this.time.now + JUMP_DELAY;
            this._player.anims.play(
                this._player.body.velocity.x > MIN_VEL_X ?
                "jumpRight" : (this._player.body.velocity.x < -MIN_VEL_X ? "jumpLeft" : "turn")
            );
        }
    }
};

export default MainScene;
