export class CombinedKeys {
    constructor(keysObj) {
        this.keysObj = keysObj;
        this.keys = Object.getOwnPropertyNames(keysObj);
    }

    isDown() {
        return this.keys.some((e) => { return this.keysObj[e].isDown; })
    }
};
