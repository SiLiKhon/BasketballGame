const DEFAULTS = {
    minVelX: 50,
    accX: 1500,
    friction: 20,
    jumpMercy: 120,
    jumpDelay: 250,
    jumpPostLandDelay: 120,
};

class _CombinedKeys {
    constructor(keysObj) {
        this.keysObj = keysObj;
        this.keys = Object.getOwnPropertyNames(keysObj);
    }

    isDown() {
        return this.keys.some((e) => { return this.keysObj[e].isDown; })
    }
};

class CharacterController {
    constructor(character, leftKeys, rightKeys, jumpKeys, options = {}) {
        this.left = new _CombinedKeys(leftKeys);
        this.right = new _CombinedKeys(rightKeys);
        this.jump = new _CombinedKeys(jumpKeys);
        this.character = character;
        this.opts = Object.assign({}, DEFAULTS, options);
        this.lastOnFloorTime = 0;
        this.landingTimer = 0;
        this.jumpTimer = 0;

        /* Checking for typos in provided options */
        var checkOptions = Object.assign({}, this.opts);
        Object.getOwnPropertyNames(DEFAULTS).forEach((name) => {delete checkOptions[name]});
        var unusedOpts = Object.getOwnPropertyNames(checkOptions);
        if (unusedOpts.length) throw Error("Unknown options: " + unusedOpts);
    }

    update(now) {
        if (this.character.body.onFloor()) {
            this.lastOnFloorTime = now;
        } else if (now - this.lastOnFloorTime > this.opts.jumpMercy) {
            this.landingTimer = now;
        }
        if (!this.left.isDown() && !this.right.isDown()) {
            this.character.setAccelerationX(0);

            if (this.character.body.onFloor()) {
                this.character.anims.play('turn');
                if (Math.abs(this.character.body.velocity.x) > this.opts.minVelX) {
                    this.character.setAccelerationX(-this.opts.friction * this.character.body.velocity.x);
                } else {
                    this.character.setVelocityX(0);
                }
            }
        } else {
            var abs_acc = this.character.body.onFloor() ? this.opts.accX : 0.25 * this.opts.accX;
            if (this.left.isDown()) {
                if (this.character.body.onFloor()) this.character.anims.play('left', true);
                this.character.setAccelerationX(-abs_acc);
                if (Math.abs(this.character.body.velocity.x) < this.opts.minVelX) {
                    this.character.body.velocity.x = -this.opts.minVelX;
                }
            } else if (this.right.isDown()) {
                if (this.character.body.onFloor()) this.character.anims.play('right', true);
                this.character.setAccelerationX(abs_acc);
                if (Math.abs(this.character.body.velocity.x) < this.opts.minVelX) {
                    this.character.body.velocity.x = this.opts.minVelX;
                }
            }
            if (this.character.body.onFloor() && this.character.body.velocity.x * this.character.body.acceleration.x < 0) {
                var friction_dec = -this.opts.friction * this.character.body.velocity.x;
                if (Math.abs(friction_dec) > Math.abs(this.character.body.acceleration.x)) {
                    this.character.setAccelerationX(friction_dec);
                }
            }
        }

        if (
            this.jump.isDown()
            && now > this.jumpTimer
            && now - this.lastOnFloorTime < this.opts.jumpMercy
            && now - this.landingTimer > this.opts.jumpPostLandDelay
        ) {
            this.character.setVelocityY(-1200);
            this.jumpTimer = now + this.opts.jumpDelay;
            this.character.anims.play(
                this.character.body.velocity.x > this.opts.minVelX ?
                "jumpRight" : (this.character.body.velocity.x < -this.opts.minVelX ? "jumpLeft" : "turn")
            );
        }
    }
};

export default CharacterController;
