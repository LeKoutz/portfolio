import { showMenu } from './menu.js';
import { input, startListeners } from './key_bindings.js';
import { playBGM } from './audio.js';
import { state } from './state.js';
import { player, PLAYER_START_X, PLAYER_START_Y } from './player.js';
import { placeBomb, updateBombs, clearBombs, updateFires, updateExplosions } from './bomb.js';
import { generateMap, mapLayout, resetMap } from './map.js';
import { getEntityTile, makeTimer } from './utils.js';
import { enemies, clearEnemies, spawnEnemies, Enemy } from './enemy.js';

const hudCache = { lives: null, score: null, timer: null, fps: null };
let hudElements = null;
let fpsUpdateTimer = 0;
let grid = null;
let gridStatic = null;
let gridDynamic = null;

export const gameLoop = () => {
    if (state.inMenu) return;

    let deltaTime = (performance.now() - state.lastTime) / 1000;
    state.lastTime = performance.now();
    deltaTime = Math.min(deltaTime, 0.1);
    player.update(deltaTime);
    player.render();
    enemies.forEach(enemy => {
        enemy.update(deltaTime)
        enemy.render()
        if (enemy.isCollidingWithPlayer()) enemy.attack()
    })
    state.hud.timer.update(deltaTime);
    updateHUD(deltaTime);

    checkWinCondition();

    if (gridDynamic) {
        updateBombs(deltaTime, gridStatic, gridDynamic);
        updateFires(deltaTime);
        updateExplosions(deltaTime, gridStatic, gridDynamic);
    }

    if (input.action) {
        placeBomb(player, gridDynamic);
        // reset action to prevent multiple placements
        input.action = false;
    }
    state.animationId = requestAnimationFrame(gameLoop);
}

// BOOTSTRAP
export function startGame() {
    resetGame()
    state.inGame = true
    state.inMenu = false
    document.querySelector('.menu').style.display = 'none'
    startListeners()
    gameLoop()
}

export function pauseGame() {
    cancelAnimationFrame(state.animationId)
    input.action = false
    state.inGame = true
    state.inMenu = true
    showMenu('pause')
}

export function resumeGame() {
    state.inGame = true
    state.inMenu = false
    state.lastTime = performance.now();
    document.querySelector('.menu').style.display = 'none'
    gameLoop()
}

export function restartGame() {
    cancelAnimationFrame(state.animationId)
    startGame()
}

export function gameOver() {
    cancelAnimationFrame(state.animationId)
    state.inGame = false
    state.inMenu = true
    showMenu('gameover')
}

export function gameWon() {
    cancelAnimationFrame(state.animationId)
    state.inGame = false
    state.inMenu = true
    showMenu('win')
}

export function resetGame() {
    state.lastTime = performance.now()
    state.hud.score.reset()
    state.hud.lives.reset()
    state.hud.timer.reset()
    hudCache.lives = null
    hudCache.score = null
    hudCache.timer = null
    hudCache.fps = null
    fpsUpdateTimer = 0
    state.exitRevealed = false
    clearBombs()
    clearEnemies()
    player.x = PLAYER_START_X
    player.y = PLAYER_START_Y
    player.hp.reset()
    player.lives.reset()
    player.applyImmunity()
    const existingGrid = document.getElementById('grid');
    if (existingGrid) existingGrid.remove();
    const root = document.getElementById('root');
    grid = document.createElement('div');
    grid.id = 'grid';
    gridStatic = document.createElement('div');
    gridStatic.id = 'grid-static';
    gridDynamic = document.createElement('div');
    gridDynamic.id = 'grid-dynamic';
    grid.append(gridStatic, gridDynamic);
    player.element.id = 'player';
    root.appendChild(grid);
    gridDynamic.appendChild(player.element);
    generateMap(gridStatic);
    spawnEnemies(gridDynamic);
    renderHUD();
}

showMenu(state.menuState);

document.querySelector('.menu').addEventListener('click', (e) => {
    const button = e.target.closest('button')
    if (!button) return

    if (button.id === 'primary-button') {
        playBGM();
        switch (state.menuState) {
            case 'start':   startGame(); break
            case 'pause':   resumeGame(); break
            case 'gameover': startGame(); break
            case 'win':     startGame(); break
        }
    }

    if (button.id === 'secondary-button') {
        playBGM();
        switch (state.menuState) {
            case 'pause':   restartGame(); break
        }
    }
})

function renderHUD() {
    const existingHUD = document.getElementById('hud');
    if (existingHUD) existingHUD.remove();
    const hud = document.createElement('div')
    hud.classList.add('hud')
    hud.setAttribute('id', 'hud')
    const logo = document.createElement('span')
    logo.setAttribute('id', 'hud-logo')
    logo.classList.add('hud-logo')
    const logoImage = document.createElement('img')
    logoImage.src = 'img/bomberman-menu1.png'
    logoImage.alt = 'Bomberman'
    logo.append(logoImage)

    const livesPanel = createHUDPanel('Lives:', 'hud-lives')
    const scorePanel = createHUDPanel('Score:', 'hud-score')
    const timerPanel = createHUDPanel('Time:', 'hud-timer')
    const fpsPanel = createHUDPanel('FPS:', null, 'fps')

    hud.append(logo, livesPanel, scorePanel, timerPanel, fpsPanel)
    grid.before(hud)
    hudElements = {
        logo: document.getElementById('hud-logo'),
        lives: document.getElementById('hud-lives'),
        score: document.getElementById('hud-score'),
        timer: document.getElementById('hud-timer'),
        fps: document.querySelector('.fps'),
    }
    hudElements.lives.textContent = `Lives: ${state.hud.lives.value()}`;
    hudElements.score.textContent = `Score: ${state.hud.score.value()}`;
    hudElements.timer.textContent = `Time: ${state.hud.timer.value()}`;
    hudElements.fps.textContent = '--';
}

function createHUDPanel(title, valueId, valueClass) {
    const panel = document.createElement('span')
    panel.classList.add('panel')

    const panelTitle = document.createElement('span')
    panelTitle.classList.add('panel-title')
    panelTitle.textContent = title

    const panelValue = document.createElement('span')
    if (valueId) panelValue.setAttribute('id', valueId)
    if (valueClass) panelValue.classList.add(valueClass)

    panel.append(panelTitle, panelValue)
    return panel
}

function updateHUD(deltaTime) {
    const lives = state.hud.lives.value();
    const score = state.hud.score.value();
    const timer = state.hud.timer.value();

    if (lives !== hudCache.lives) {
        hudElements.lives.textContent = lives;
        hudCache.lives = lives;
        if (lives === 0) { return gameOver() }
    }
    if (score !== hudCache.score) {
        hudElements.score.textContent = score;
        hudCache.score = score;
    }
    if (timer !== hudCache.timer) {
        hudElements.timer.textContent = timer;
        hudCache.timer = timer;
        if (timer === 0) {
            player.die()
            state.hud.timer.reset()
            return
        }
    }

    fpsUpdateTimer += deltaTime;
    if (fpsUpdateTimer >= 0.25) {
        const fps = Math.round(1 / deltaTime);
        hudElements.fps.textContent = fps;
        hudCache.fps = fps;
        fpsUpdateTimer = 0;
    }
}

function checkWinCondition() {
    if ( enemies.length > 0 ) return
    const { row, col } = getEntityTile(player)
    if ( mapLayout[row][col] === 4 ) {
        gameWon()
    }
}
