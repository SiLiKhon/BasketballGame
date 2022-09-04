const DEFAULTS = {
    minVelX: 50,
    accX: 2000,
    airAccX: 1500,
    friction: 40,
    jumpMercy: 120,
    jumpDelay: 250,
    jumpPostLandDelay: 120,
    jumpAccFrames: 12,
    jumpStartVelocity: 800,
    jumpAddVelocity: 15,
};

import { CombinedKeys } from './utils.js';

class CharacterController {
    constructor(character, leftKeys, rightKeys, jumpKeys, options = {}) {
        this.left = new CombinedKeys(leftKeys);
        this.right = new CombinedKeys(rightKeys);
        this.jump = new CombinedKeys(jumpKeys);
        this.character = character;
        this.opts = Object.assign({}, DEFAULTS, options);
        this.lastOnFloorTime = 0;
        this.landingTimer = 0;
        this.jumpTimer = 0;
        this.jumpCounter = 0;

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
            var abs_acc = this.character.body.onFloor() ? this.opts.accX : this.opts.airAccX;
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
            && now > this.jumpTimer + this.opts.jumpDelay
            && now - this.lastOnFloorTime < this.opts.jumpMercy
            && now - this.landingTimer > this.opts.jumpPostLandDelay
        ) {
            this.character.setVelocityY(-this.opts.jumpStartVelocity);
            this.jumpTimer = now;
            this.character.anims.play(
                this.character.body.velocity.x > this.opts.minVelX ?
                "jumpRight" : (this.character.body.velocity.x < -this.opts.minVelX ? "jumpLeft" : "turn")
            );
            this.jumpCounter = 1;
        } else if (
            this.jump.isDown()
            && this.jumpCounter > 0
            && this.jumpCounter < this.opts.jumpAccFrames
        ) {
            this.character.body.velocity.y -= this.opts.jumpAddVelocity * (
                this.opts.jumpAccFrames - this.jumpCounter
            );
            this.jumpCounter += 1;
        } else {
            this.jumpCounter = 0;
        }
    }
};

export default CharacterController;
