import { state } from "./state.js";
import { getRandomValidTile } from "./utils.js";

export const TILE_SIZE = 40;
export const MAP_ROWS = 13;
export const MAP_COLS = 15;
export const GRID_WIDTH = MAP_COLS * TILE_SIZE;
export const GRID_HEIGHT = MAP_ROWS * TILE_SIZE;

// 0 - empty space
// 1 - indestructible
// 2 - brick (destructible)
// 3 - bomb
// 4 - exit
// 5 - enemy spawn
const INITIAL_MAP_LAYOUT = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 2, 2, 0, 2, 2, 2, 0, 2, 0, 0, 5, 1],
    [1, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 1, 0, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 0, 1, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 1],
    [1, 5, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 5, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export const mapLayout = INITIAL_MAP_LAYOUT.map(row => [...row]);

export const mapEntities = [];

export function resetMap() {
    for (let row = 0; row < INITIAL_MAP_LAYOUT.length; row++) {
        mapLayout[row] = [...INITIAL_MAP_LAYOUT[row]];
    }

    mapEntities.length = 0;
}

export function generateMap(gridStatic) {
    mapLayout.length = 0;
    mapEntities.length = 0;

    for (let i = 0; i < INITIAL_MAP_LAYOUT.length; i++) {
        mapLayout.push([...INITIAL_MAP_LAYOUT[i]]);
    }

    const fragment = document.createDocumentFragment()

    for (let row = 0; row < mapLayout.length; row++) {
        for (let col = 0; col < mapLayout[row].length; col++) {
            const tileType = mapLayout[row][col];

            if (tileType === 0) continue;

            const tileDiv = document.createElement('div');

            if (tileType === 1) tileDiv.classList.add('wall');
            if (tileType === 2) tileDiv.classList.add('brick');

            const xPos = col * TILE_SIZE;
            const yPos = row * TILE_SIZE;

            tileDiv.style.transform = `translate(${xPos}px, ${yPos}px)`;

            fragment.appendChild(tileDiv);

            mapEntities.push({
                element: tileDiv,
                row: row,
                col: col,
                type: tileType
            });
        }
    }
    gridStatic.appendChild(fragment)
    placeExit();
}

export function placeExit() {
    const tile = getRandomValidTile(2)
    if (!tile) return
    mapLayout[tile.row][tile.col] = 4
}

export function revealExit(x, y) {
    if (state.exitRevealed) return
    const exitDiv = document.createElement('div')
    exitDiv.classList.add('exit')
    exitDiv.style.transform = `translate(${x * TILE_SIZE}px, ${y * TILE_SIZE}px)`
    state.exitRevealed = true
    return exitDiv
}
