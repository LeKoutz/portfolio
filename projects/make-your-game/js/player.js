// PLAYAH
import { input } from './key_bindings.js';
import { state } from './state.js';
import { getEntityTile, makeCounter } from './utils.js';
import { Character, IMMUNITY_DURATION } from './character.js';
import { TILE_SIZE, mapLayout, GRID_WIDTH, GRID_HEIGHT } from './map.js';
import { getBombAt } from './bomb.js';

export const PLAYER_START_X = 40;
export const PLAYER_START_Y = 40;
export const PLAYER_SPEED = 200;
export const PLAYER_SIZE = 40;
export const PLAYER_HP = 1;
export const PLAYER_LIVES = 3;

export class Player extends Character {
    constructor() {
        super(PLAYER_START_X, PLAYER_START_Y, 1)
        this.lives = makeCounter(3)
        this.element.classList.add('updown');
        this.applyImmunity();
    }
    update(deltaTime) {
        if (this.isImmune) {
            this.immunityTimer.update(deltaTime)
            if (this.immunityTimer.value() <= 0) {
                this.removeImmunity()
            }
        }

        const step = PLAYER_SPEED * deltaTime;
        const prevTile = getEntityTile(this)

	    const movingRight = input.keys['ArrowRight']
        const movingLeft  = input.keys['ArrowLeft']
        const movingDown  = input.keys['ArrowDown']
        const movingUp    = input.keys['ArrowUp']

	    if (movingRight || movingLeft) {
            const nextX = movingRight ? player.x + step : player.x - step
            const result = this.resolveMoveX(nextX)
            player.x = result.x

            if (!movingUp && !movingDown) {
                if (!result.topBlocked && result.bottomBlocked) nudgeY(step, 'up')
                if (result.topBlocked && !result.bottomBlocked) nudgeY(step, 'down')
                }
        }

	    if (movingDown || movingUp) {
            const nextY = movingDown ? player.y + step : player.y - step
            const result = this.resolveMoveY(nextY)
            player.y = result.y

            if (!movingLeft && !movingRight) {
                if (!result.leftBlocked && result.rightBlocked)  nudgeX(step, 'left')
                if (result.leftBlocked && !result.rightBlocked)  nudgeX(step, 'right')
                }
        }

        const nextTile = getEntityTile(this)
        if (prevTile.col !== nextTile.col || prevTile.row !== nextTile.row) {
            const bomb = getBombAt(prevTile.col, prevTile.row)
            if (bomb) bomb.passable = false
        }


        if (movingLeft) this.setPlayerDirection('ArrowLeft')
        else if (movingRight) this.setPlayerDirection('ArrowRight')
        else if (movingUp || movingDown) this.setPlayerDirection('ArrowUp')
    }
    die() {
        this.lives.decrement(1)
        state.hud.lives.decrement(1)
        this.x = PLAYER_START_X
        this.y = PLAYER_START_Y
        this.hp.reset()
        this.applyImmunity()
    }
    setPlayerDirection(direction) {
        this.element.classList.remove('updown', 'left', 'right');

        if (direction === 'ArrowLeft') {
            this.element.classList.add('left');
        } else if (direction === 'ArrowRight') {
            this.element.classList.add('right');
        } else {
            this.element.classList.add('updown');
        }
    }
    isWalkable(col, row) {
        if (super.isWalkable(col, row)) return true
        const bomb = getBombAt(col, row)
        return bomb ? bomb.passable : false
    }
}

export const player = new Player()

function nudgeY(step, direction) {
    if (direction === 'up') {
        const snapY = Math.floor(player.y / TILE_SIZE) * TILE_SIZE
        player.y = player.resolveMoveY(player.y - Math.min(step, player.y - snapY)).y
    } else {
        const snapY = Math.ceil((player.y + PLAYER_SIZE) / TILE_SIZE) * TILE_SIZE - PLAYER_SIZE
        player.y = player.resolveMoveY(player.y + Math.min(step, snapY - player.y)).y
    }
}

function nudgeX(step, direction) {
    if (direction === 'left') {
        const snapX = Math.floor(player.x / TILE_SIZE) * TILE_SIZE
        player.x = player.resolveMoveX(player.x - Math.min(step, player.x - snapX)).x
    } else {
        const snapX = Math.ceil((player.x + PLAYER_SIZE) / TILE_SIZE) * TILE_SIZE - PLAYER_SIZE
        player.x = player.resolveMoveX(player.x + Math.min(step, snapX - player.x)).x
    }
}