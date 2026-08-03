# b0mb3rm4n

💣 **b0mb3rm4n** is a browser-based game.

The game is inspired by the classic Bomberman game. The player moves inside a tile map, places bombs, destroys bricks, avoids enemies, and tries to find the hidden exit.

## 🎮 How The Game Works

- 🧍 The player moves around the map with the keyboard.
- 💣 The player can place one bomb at a time.
- 🔥 Bombs explode after a short timer and can destroy bricks.
- 👾 Enemies move around the map and damage the player on contact.
- 🚀 The exit is hidden under a brick and is revealed during the game.
- 🏆 The player wins when all enemies are defeated and the exit is reached.
- ❤️ Player loses life when timer runs out, gets in touch with an enemy or being on radius of a bomb exploding
Game over is when all lives are gone.


## ⌨️ Controls

- ⬆️⬇️⬅️➡️ Move the player with the arrow keys
- Space: place a bomb
- Escape: pause or continue the game
- M: mute or unmute the sound

## 🛠️ How It Is Built

This project uses plain web technologies:

- 🌐 HTML for the page structure
- 🎨 CSS for the visuals, sprites, animations, menu, and HUD
- ⚙️ JavaScript modules for the game logic

The game does not use canvas or any JavaScript framework. It uses DOM elements, CSS backgrounds, CSS animations, and `requestAnimationFrame` for the main game loop.

## 🧩 How The Code Works

The code is split into small JavaScript modules. Each file has a clear job, so the project is easier to read and change.

The game starts from `index.html`, which loads `js/app.js`. From there, `startGame()` in `js/game.js` creates the map, the player, the enemies, and the HUD.

The main game loop runs with `requestAnimationFrame`. On every frame, the game updates the player movement, enemy movement, bombs, explosions, timer, score, and win or lose conditions.

The map is stored as a grid of numbers in `js/map.js`. Each number means a different tile type, like empty space, wall, brick, bomb, exit, or enemy spawn point.

The game is rendered with HTML elements. For example, the player, enemies, bombs, fire, walls, and bricks are all `div` elements. JavaScript changes their position, and CSS gives them images, colors, and animations.

## ▶️ How To Run

Because the project uses JavaScript modules, it is best to run it with a small local server.

From the project folder, you can run:

```bash
npx serve
```

Then open this URL in your browser:

```text
   ┌────────────────────────────────────────────┐
   │                                            │
   │   Serving!                                 │
   │                                            │
   │   - Local:    http://localhost:3000        │
   │   - Network:  http://172.28.191.123:3000   │
   │                                            │
   │   Copied local address to clipboard!       │
   │                                            │
   └────────────────────────────────────────────┘

```


## 📁 Main Files

- `index.html` loads the game
- `css/styles.css` contains the visual style and animations
- `js/game.js` controls the main game loop
- `js/map.js` creates the tile map
- `js/player.js` handles player movement
- `js/bomb.js` handles bombs, fire, and explosions
- `js/enemy.js` handles enemy behavior
- `js/menu.js` handles the menu screens

## 👥 Creators

Made by:

- motonai x
- Georgios Koutzos
- Constantine Ktistakis
- Stergios Georgopanos