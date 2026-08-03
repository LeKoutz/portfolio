import { player, PLAYER_SIZE } from './player.js';
import { Character, CHARACTER_SIZE } from './character.js';
import { TILE_SIZE, mapLayout } from './map.js';
import { findCellsByValue, getRandomValidTile } from './utils.js';
import { state } from './state.js';

const ENEMY_SPEED = 75;

export const enemies = [];

export class Enemy extends Character {
    constructor(x, y) {
        super(x, y, 1);
        this.speed = ENEMY_SPEED;
        this.currentDirection = this.getRandomDirection();

        // Setup DOM element
        this.element.classList.add('enemy');
        this.element.classList.add('left');
        this.element.style.width = `${PLAYER_SIZE}px`;
        this.element.style.height = `${PLAYER_SIZE}px`;
        this.element.style.position = 'absolute';
    }
    update(deltaTime) {
        if (this.isImmune) {
            this.immunityTimer.update(deltaTime)
            if (this.immunityTimer.value() <= 0) {
                this.removeImmunity()
            }
        }
        const step = this.speed * deltaTime;
        let blocked = false

        const movingRight = this.currentDirection === 'ArrowRight'
        const movingLeft  = this.currentDirection === 'ArrowLeft'
        const movingDown  = this.currentDirection === 'ArrowDown'
        const movingUp    = this.currentDirection === 'ArrowUp'

        if (movingRight || movingLeft) {
            const nextX = movingRight ? this.x + step : this.x - step
            const result = this.resolveMoveX(nextX)
            if (this.isBlockedByOtherEnemies(result.x, this.y)) {
                blocked = true
            } else {
                blocked = result.x === this.x
                this.x = result.x
            }
        }

        if (movingDown || movingUp) {
            const nextY = movingDown ? this.y + step : this.y - step
            const result = this.resolveMoveY(nextY)
            if (this.isBlockedByOtherEnemies(this.x, result.y)) {
                blocked = true
            } else {
                blocked = result.y === this.y
                this.y = result.y
            }
        }

        if (blocked) {
            this.currentDirection = this.getRandomDirection()
        }
    }

    getRandomDirection() {
        const dirs = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        return dirs[Math.floor(Math.random() * dirs.length)];
    }

    isCollidingWithPlayer() {
        const margin = CHARACTER_SIZE / 4
        return (
            this.x + margin < player.x + CHARACTER_SIZE - margin &&
            this.x + CHARACTER_SIZE - margin > player.x + margin &&
            this.y + margin < player.y + CHARACTER_SIZE - margin &&
            this.y + CHARACTER_SIZE - margin > player.y + margin
        )
    }

    isBlockedByOtherEnemies(nextX, nextY) {
        return enemies.some(other => {
            if (other === this) return false
            return (
                nextX < other.x + CHARACTER_SIZE &&
                nextX + CHARACTER_SIZE > other.x &&
                nextY < other.y + CHARACTER_SIZE &&
                nextY + CHARACTER_SIZE > other.y
            )
        })
    }

    attack() {
        player.hp.decrement(1)
        if (player.hp.value() <= 0) player.die()
    }

    die() {
        this.element.remove()
        state.hud.score.increment(100)
    }
}

export function spawnEnemies(gridDynamic) {
    const spawnPoints = findCellsByValue(mapLayout, 5);
    for (const point of spawnPoints) {
        // tiles must be empty
        if (mapLayout[point.r][point.c] === 5) {
            const xPos = point.c * TILE_SIZE;
            const yPos = point.r * TILE_SIZE;
            const enemy = new Enemy(xPos, yPos);
            enemies.push(enemy)
            
            enemy.render();
            mapLayout[point.r][point.c] = 0;
            gridDynamic.appendChild(enemy.element);
        }
    }
}

export function spawnEnemy(gridDynamic, position=getRandomValidTile(0)) {
    const y = position.row * TILE_SIZE
    const x = position.col * TILE_SIZE
    const enemy = new Enemy(x, y)
    enemy.applyImmunity()
    enemies.push(enemy)
    enemy.render()
    gridDynamic.append(enemy.element)
}

export function clearEnemies() {
    enemies.forEach(enemy => enemy.element.remove())
    enemies.length = 0
}
