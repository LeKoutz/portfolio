import { gameLoop } from "./game.js";
import { state } from "./state.js";

export function showMenu(type) {
    state.menuState = type
    const menu = document.querySelector('.menu');
    const title = document.querySelector('.menu-title');
    const primaryButton = document.querySelector('#primary-button')
    const secondaryButton = document.querySelector('#secondary-button')
    const image = document.querySelector('.menu-bomberman')

    menu.style.display = 'flex'
    primaryButton.focus()

    switch (type) {
        case 'start':
            primaryButton.textContent = 'New Game'
            secondaryButton.hidden = true;
            image.style.backgroundImage = "url('img/bomberman-menu1.png')"
            image.style.animationName = 'bombermanFly'
            break
        case 'pause':
            primaryButton.textContent = 'Continue'
            secondaryButton.textContent = 'Restart'
            secondaryButton.hidden = false;
            image.style.backgroundImage = "url('img/bomberman-menu1.png')"
            image.style.animationName = 'bombermanFly'
            break
        case 'gameover':
            primaryButton.textContent = 'Try Again'
            secondaryButton.hidden = true;
            title.src = 'img/gameover.png'
            image.style.backgroundImage = "url('img/bomberman-gameover.png')"
            image.style.animationName = 'none'
            break
        case 'win':
            primaryButton.textContent = 'Play Again'
            secondaryButton.hidden = true
            title.src = 'img/gamewon.png'
            image.style.backgroundImage = "url('img/bomberman-gamewin.png')"
            image.style.animationName = 'none'
            break
    }
}
