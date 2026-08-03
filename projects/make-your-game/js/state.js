import { makeCounter, makeTimer } from "./utils.js";
import { PLAYER_HP, PLAYER_LIVES } from "./player.js";

export let state = {
    lastTime: performance.now(),
    currentTime: performance.timeOrigin,
    inMenu: true,
    inGame: false,
    menuState: 'start',
    animationId: null,
    exitRevealed: false,
    hud: {
        score: makeCounter(),
        lives: makeCounter(PLAYER_LIVES),
        timer: makeTimer(180),
    }
}
