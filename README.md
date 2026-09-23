# Tic Tac Toe

A two-player React game for my FSAB developer application. X goes first, and players take turns on the same device. The game checks for wins and draws and blocks invalid moves.

## How to run

Use Node.js 22.12 or newer. In the project folder, run:

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal. `npm run build` creates a production build.

## What I added

The game follows the React tutorial's board, squares, and turn logic. The additions are restart, a draw message, winning-square highlights, three color themes, and an optional 30- or 60-second clock for each player.

Only the current player's clock runs. Running out of time loses the round. Changing colors keeps your moves; changing the clock resets the game. Refreshing the page resets everything.

I chose the color-switching and chess-clock ideas. Codex helped with the code, testing, and README.

## What I learned

One challenge was keeping the board and turn in sync. The game keeps them in React state and passes values and click handlers through props. Each valid move copies the board before updating it. The timer also needs cleanup so an old interval does not keep running after a turn or round ends.

## References

- [React Tic-Tac-Toe tutorial](https://react.dev/learn/tutorial-tic-tac-toe)
- FSAB Developer Bootcamp materials
- [Vite documentation](https://vite.dev/guide/)
