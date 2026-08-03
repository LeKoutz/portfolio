import { TILE_SIZE, mapLayout } from "./map.js"

export function throttle (func, wait) {
    let timer
    let callPending = false
    return function(...args) {
        if (timer) {
            callPending = true
            return
        }
        func(...args)
        timer = setTimeout(function run() {
            timer = null
            if (callPending) {
                callPending = false
                func(...args)
                timer = setTimeout(run, wait)
            }
        }, wait)
    }
}

export function makeCounter(value = 0) {
    let count = value
    return {
        increment(value) {
            count += value
        },
        decrement(value) {
            count -= value
        },
        reset(newValue) {
            count = newValue ?? value
        },
        value() {
            return count
        }
    }
}

export function makeTimer(seconds) {
    let timeLeft = seconds
    return {
        update(deltaTime) {
            if (timeLeft <= 0) return
            timeLeft -= deltaTime
            if (timeLeft < 0) timeLeft = 0
        },
        value() {
            return Math.ceil(timeLeft)
        },
        reset(newSeconds) {
            timeLeft = newSeconds ?? seconds
        }
    }
}

export function getEntityTile(entity) {
    return {
        col: Math.floor((entity.x + TILE_SIZE / 2) / TILE_SIZE),
        row: Math.floor((entity.y + TILE_SIZE / 2) / TILE_SIZE)
    }
}

export function getRandomValidTile(tileType) {
    const tiles = []
    for (let row = 0; row < mapLayout.length; row++) {
        for (let col = 0; col < mapLayout[row].length; col++) {
            if (mapLayout[row][col] === tileType) {
                tiles.push({ row, col })
            }
        }
    }
    if (tiles.length === 0) return null
    return tiles[Math.floor(Math.random() * tiles.length)]
}

export function findCellsByValue(grid, value) {
    const result = [];
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === value) {
                result.push({r:r, c:c});
            }
        }
    }
    return result;
}
