import { state } from './state.js';

const sounds = {
    bgm: new Audio('./sounds/ambient.mp3'),
    explosion: new Audio('./sounds/explosion.mp3'),
};

sounds.bgm.loop = true;
sounds.bgm.volume = 0.3;

export function playBGM() {
    if (state.isMuted) return;
    sounds.bgm.play();
}

export function pauseBGM() {
    sounds.bgm.pause();
}

export function toggleMute() {
    state.isMuted = !state.isMuted;

    if (state.isMuted) {
        pauseBGM();
        console.log("Audio Muted");
    } else {
        playBGM();
        console.log("Audio Unmuted");
    }
}

export function playBoom() {
    if (state.isMuted) return;
    const boomClone = sounds.explosion.cloneNode(true);
    boomClone.volume = 0.5;
    boomClone.play();
}

export function pauseBoom() {
    sounds.explosion.pause();
}