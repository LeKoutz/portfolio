import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, mapLayout } from './map.js';
import { state } from './state.js';
import { makeCounter, makeTimer } from './utils.js';

export const CHARACTER_SIZE = 40;
export const CHARACTER_SPEED = 200;
export const IMMUNITY_DURATION = 5;

export class Character {
    constructor(x, y, hp) {
        this.x = x
        this.y = y
        this.hp = makeCounter(hp)
        this.speed = CHARACTER_SPEED
        this.element = document.createElement('div')
        this.isImmune = false
        this.immunityTimer = makeTimer(0)
    }
    render() {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
    resolveMoveX(nextX) {
        nextX = Math.max(0, Math.min(nextX, GRID_WIDTH - CHARACTER_SIZE))

        const col = nextX > this.x
            ? Math.floor((nextX + CHARACTER_SIZE - 1) / TILE_SIZE) // moving right
            : Math.floor(nextX / TILE_SIZE) // moving left

        const topRow    = Math.floor(this.y / TILE_SIZE)
        const bottomRow = Math.floor((this.y + CHARACTER_SIZE - 1) / TILE_SIZE)

        const topBlocked = !this.isWalkable(col, topRow)
        const bottomBlocked = !this.isWalkable(col, bottomRow)

        if (!topBlocked&& !bottomBlocked) {
            return { x: nextX, topBlocked, bottomBlocked }
        }

        const maxX = nextX > this.x
            ? col * TILE_SIZE - CHARACTER_SIZE
            : (col + 1) * TILE_SIZE

        return { x: maxX, topBlocked, bottomBlocked}
    }

    resolveMoveY(nextY) {
        nextY = Math.max(0, Math.min(nextY, GRID_HEIGHT - CHARACTER_SIZE))

        const row = nextY > this.y
            ? Math.floor((nextY + CHARACTER_SIZE - 1) / TILE_SIZE) // moving down
            : Math.floor(nextY / TILE_SIZE) // moving up

        const leftCol = Math.floor(this.x / TILE_SIZE)
        const rightCol = Math.floor((this.x + CHARACTER_SIZE - 1) / TILE_SIZE)

        const leftBlocked = !this.isWalkable(leftCol, row)
        const rightBlocked = !this.isWalkable(rightCol, row)

        if (!leftBlocked && !rightBlocked) {
            return { y: nextY, leftBlocked, rightBlocked }
        }

        const maxY = nextY > this.y
            ? row * TILE_SIZE - CHARACTER_SIZE
            : (row + 1) * TILE_SIZE

        return { y: maxY, leftBlocked, rightBlocked }
    }

    isWalkable(col, row) {
        if (row < 0 || row >= mapLayout.length || col < 0 || col >= mapLayout[0].length) {
            return false;
        }
        const tile = mapLayout[row][col];

        if (tile === 4) return state.exitRevealed
        return tile !== 1 && tile !== 2 && tile !== 3;
    }

    applyImmunity() {
        this.isImmune = true
        this.element.classList.add('immune')
        this.immunityTimer.reset(IMMUNITY_DURATION);
        this.preImmunityHP = this.hp.value();
        this.hp.reset(Number.POSITIVE_INFINITY)
    }

    removeImmunity() {
        this.isImmune = false
        this.element.classList.remove('immune')
        this.hp.reset(this.preImmunityHP)
    }

    update(deltaTime) {}
    die() {}
}

