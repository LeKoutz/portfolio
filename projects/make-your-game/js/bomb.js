import { TILE_SIZE, mapLayout, mapEntities, revealExit } from './map.js';
import { playBoom } from './audio.js';
import { state } from './state.js';
import { getEntityTile } from './utils.js';
import { player, PLAYER_START_X, PLAYER_START_Y } from './player.js';
import { enemies, spawnEnemy } from './enemy.js';

export const activeBombs = [];
const EXPLOSION_RADIUS = 1;
export const activeFires = [];
const FIRE_DURATION = 0.3;
const EXPLOSION_FRAME_DURATION = 500;
const EXPLOSION_SPREAD_DELAY = 0.2;
const pendingExplosions = [];

export function clearBombs() {
    activeBombs.forEach(bomb => bomb.element.remove());
    activeBombs.length = 0;
    pendingExplosions.length = 0;
}

export function placeBomb(player, gridDynamic) {
    if (activeBombs.length >= 1) return;

    // find the center of the player
    const centerX = player.x + (TILE_SIZE / 2);
    const centerY = player.y + (TILE_SIZE / 2);
    
    // snap the bomb to the nearest grid
    const bombX = Math.floor(centerX / TILE_SIZE);
    const bombY = Math.floor(centerY / TILE_SIZE);

    // only place if the space is empty
    if (mapLayout[bombY][bombX] !== 0) return;

    // update map (3 = bomb)
    mapLayout[bombY][bombX] = 3;

    const bombDiv = document.createElement('div');

    bombDiv.classList.add('bomb');
    bombDiv.style.transform = `translate(${bombX * TILE_SIZE}px, ${bombY * TILE_SIZE}px)`;
    gridDynamic.appendChild(bombDiv);

    activeBombs.push({
        element: bombDiv,
        x: bombX,
        y: bombY,
        timer: 3,
        passable: true
    });
}

export function updateBombs(deltaTime, gridStatic, gridDynamic) {
    // loop backwards to safely remove bombs while iterating
    for (let i = activeBombs.length - 1; i >= 0; i--) {
        let bomb = activeBombs[i];
        // subtract elapsed time from bomb timer
        bomb.timer -= deltaTime;
        // if timer reaches 0, boom
        if (bomb.timer <= 0) {
            bomb.element.remove();
            activeBombs.splice(i, 1);
            explodeBomb(bomb.x, bomb.y, gridStatic, gridDynamic);
        }
    }
}

function explodeBomb(x, y, gridStatic, gridDynamic) {
    // update map (0 = empty)
    mapLayout[y][x] = 0;

    playBoom();

    // draw fire at bomb location
    drawFire(x, y, gridDynamic);

    const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }, // left
        { dx: 1, dy: 0 }   // right
    ];

    for (const dir of directions) {
        for (let step = 1; step <= EXPLOSION_RADIUS; step++) {
            const targetX = x + dir.dx * step;
            const targetY = y + dir.dy * step;

            if (targetY < 0 || targetY >= mapLayout.length || targetX < 0 || targetX >= mapLayout[0].length) {
                break;
            }

            const tile = mapLayout[targetY][targetX];
            if (tile === 1) break;

            pendingExplosions.push({
                x: targetX,
                y: targetY,
                tile,
                timer: EXPLOSION_SPREAD_DELAY * step,
                gridStatic,
                gridDynamic
            });
        }
    }
}

export function updateExplosions(deltaTime, gridStatic, gridDynamic) {
    for (let i = pendingExplosions.length - 1; i >= 0; i--) {
        const exp = pendingExplosions[i];
        exp.timer -= deltaTime;
        if (exp.timer <= 0) {
            drawFire(exp.x, exp.y, exp.gridDynamic);
            if (exp.tile === 2 || exp.tile === 4) {
                destroyBrick(exp.x, exp.y, exp.gridStatic);
            }
            pendingExplosions.splice(i, 1);
        }
    }
}

export function updateFires(deltaTime) {
    for (let i = activeFires.length - 1; i >= 0; i--) {
        const fire = activeFires[i];
        fire.timer -= deltaTime;
        if (fire.timer <= 0) {
            fire.element.remove();
            activeFires.splice(i, 1);
        }
    }
}

function drawFire(x, y, gridDynamic) {
    const fireDiv = document.createElement('div');
    fireDiv.classList.add('fire');
    fireDiv.style.transform = `translate(${x * TILE_SIZE}px, ${y * TILE_SIZE}px)`;
    gridDynamic.appendChild(fireDiv);

    activeFires.push({ element: fireDiv, timer: FIRE_DURATION });
    if (mapLayout[y][x] === 4 && state.exitRevealed) spawnEnemy(gridDynamic, {row: y, col: x})
    dealDamage(x, y, 1)
}

function destroyBrick(x, y, gridStatic) {
    const tileType = mapLayout[y][x]

    if (tileType === 4) {
        // reveal exit
        const exitDiv = revealExit(x, y)
        if (exitDiv) gridStatic.append(exitDiv)

        // remove the brick div on top
        const index = mapEntities.findIndex(e => e.row === y && e.col === x)
        if (index !== -1) {
            mapEntities[index].element.remove()
            mapEntities.splice(index, 1)
        }
        return
    }
    // normal brick destruction
    mapLayout[y][x] = 0;

    const index = mapEntities.findIndex(e => e.row === y && e.col === x);
    if (index !== -1) {
        mapEntities[index].element.remove();
        mapEntities.splice(index, 1);
    }
}

export function dealDamage(x, y, damage) {
    const playerTile = getEntityTile(player)
    if (playerTile.col === x && playerTile.row === y && !player.isImmune) {
        player.hp.decrement(damage)
        if (player.hp.value() <= 0) player.die()
    }

    // Enemies logic should go here
    for (let i = enemies.length -1; i >= 0; i--) {
        const enemy = enemies[i]
        const enemyTile = getEntityTile(enemy)
        if (enemyTile.col === x && enemyTile.row === y && !enemy.isImmune) {
            enemy.hp.decrement(damage)
            if (enemy.hp.value() <= 0) {
                enemy.die()
                enemies.splice(i, 1)
            }
        }
    }
}

export function getBombAt(col, row) {
    return activeBombs.find(bomb => bomb.x === col && bomb.y === row)
}