const WIDTH = 800;
const HEIGHT = 600;

import MainScene from "./src/scenes/mainScene.js";

var config = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 5000 },
            debug: false,
        }
    },
    scene: [ MainScene ],
};

var game = new Phaser.Game(config);

document.querySelectorAll("canvas").forEach((elem) => {
    elem.style['max-width'] = Math.round(WIDTH / window.devicePixelRatio) + "px";
    elem.style['max-height'] = Math.round(HEIGHT / window.devicePixelRatio) + "px";
});
