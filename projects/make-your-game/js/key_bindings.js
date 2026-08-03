// INPUT CONTROLLAH
import { showMenu } from './menu.js';
import { throttle } from "./utils.js";
import { state } from "./state.js";
import { pauseGame, resumeGame } from './game.js';
import { toggleMute } from "./audio.js";

export const input = {
    action: false,
    keys: {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        ' ': false
    }
};

function gameMenu(e) {
    const items = document.querySelectorAll(".menu button");
    let index = Array.from(items).findIndex(item => item === document.activeElement);
    switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
            e.preventDefault();
            const next = items[index + 1]
            if (next) next.focus();
            break;
        case "ArrowUp":
        case "ArrowLeft":
            e.preventDefault();
            const prev = items[index - 1]
            if (prev) prev.focus();
            break;
        case "Enter":
            e.preventDefault();
            document.activeElement.click();
            break;
    }
}

function keyDownHandler(event) {
    if (event.key === 'Escape' && state.inGame) {
        state.inMenu ? resumeGame() : pauseGame()
        return
    }

    if ( event.key === 'M' || event.key === 'm' ) {
        toggleMute();
    }

    if (state.inMenu) {
        gameMenu(event)
        return
    }

    if (event.key in input.keys) {
        event.preventDefault()
        input.keys[event.key] = true
        if (event.key === ' ') {
            input.action = true
        }
    }
}

function keyUpHandler(event) {
    if (event.key in input.keys) {
        event.preventDefault()
        input.keys[event.key] = false
    }
}

export function startListeners() {
    document.removeEventListener('keydown', keyDownHandler)
    document.removeEventListener('keyup', keyUpHandler)

    document.addEventListener('keydown', keyDownHandler)
    document.addEventListener('keyup', keyUpHandler)
}
