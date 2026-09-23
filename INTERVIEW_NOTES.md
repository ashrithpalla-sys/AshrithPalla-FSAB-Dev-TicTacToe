# Tic Tac Toe walkthrough

Use these to practice with the code open. The technical explanations describe the app; adjust any personal statements to match what you actually did and understand.

## A short introduction

“This is a two-player Tic Tac Toe page built with React, JavaScript, and plain CSS. It checks for wins and draws and prevents invalid moves. There is also an optional chess-style clock with a separate time budget for each player. My feature idea was changing the colors, so the game has three themes you can switch between without losing the current round. I used the bootcamp materials and React tutorial as references, and Codex helped implement and test the project.”

## How does it run?

1. `npm install` downloads the packages listed in `package.json`. The lockfile records the resolved dependency versions.
2. `npm run dev` runs Vite, which serves the project at the local URL printed in the terminal and updates the browser as files change.
3. The browser loads `index.html`, including the script pointing to `src/main.jsx`.
4. `main.jsx` imports the CSS and renders `App` inside the HTML element with `id="root"`.
5. React runs the game in the browser. There is no backend or database. Refreshing clears the game and theme because they only live in memory.

`npm run build` creates production files in `dist`. It does not publish them. `npm run preview` serves those built files locally. Node.js runs the development/build tools; the game itself runs in the browser.

## What are the components?

- `App`: owns the state, handles moves and restart, and displays the result.
- `Board`: maps the nine array entries to nine `Square` components.
- `Square`: displays a button using values and an event handler passed through props.
- `PlayerClocks`: displays each player's remaining time and marks the active clock.
- `ThemePicker`: maps the three theme names to buttons and tells `App` which one was selected.

All five are in `src/App.jsx` because this is a small page. Styling is in `src/style.css`.

## Explain one move

Clicking a square calls its `onClick` handler. `Board` passes the square's index to `App`'s `handlePlay`. That function first checks whether the square is occupied or the game is over. If so, it returns without changing anything.

For a valid move, it copies the squares array with `slice()`, puts the current player's mark at that index, then calls `setSquares` and `setXIsNext`. React renders the updated board and status from the new state. In a timed game, the handler first checks the deadline, saves the moving player's remaining time, and sets the next player's deadline.

## What is state? What are props?

State is information a component remembers between renders. The game stores the nine squares, whether X moves next, and the theme in state. The timer also stores the selected time limit, both remaining time budgets, and whether the timed round has started.

Props are inputs passed from a parent component to a child. For example, `App` passes the squares to `Board`, and `Board` passes each square's value to `Square`. Callback functions are also props: a child uses them to tell the parent about a click.

## Why copy the array?

React state should be treated as read-only. `slice()` makes a new array so the code can change the next board without mutating the previous state. Passing that new array to the setter tells React to update the interface.

## How do wins and draws work?

`findWinningLine` checks eight combinations: three rows, three columns, and two diagonals. A line wins if its first square is nonempty and all three values match. It returns the three indices so the UI can highlight them. Otherwise it returns an empty array.

A draw means every square is occupied and there is no winner. Checking for a winner first matters: the ninth move can still win. The winner and draw are calculated from the board instead of stored in separate state, which avoids keeping duplicate information in sync.

## How does the color feature work?

`theme` starts as `Paper`. The theme picker receives that value and `setTheme` through props. Clicking Ocean calls the setter with `Ocean`. React updates `data-theme` on the main element, and CSS selectors choose the matching color variables, such as `--x-color` and `--surface`.

The theme setter never changes the board or turn state, so a game can continue during a color change. Restart also leaves the theme alone. Each theme button uses `aria-pressed` to expose whether it is selected.

## What challenge can I discuss?

One concrete design problem is separating appearance from game state. You can demonstrate the solution by switching themes midway through a round: only `theme` changes; the moves and turn remain intact. Discuss this as something you learned only after you can explain and demonstrate it yourself.

Another useful edge case is a full board with a winning ninth move. The draw check explicitly excludes a winner so it shows the correct result.

## How was it tested?

The initial checks covered all eight winning lines, an O win, a draw, a ninth-move win, disabled squares, restart, keyboard input, and mobile overflow. Installation and production build were also checked from a clean copy. Codex ran those checks; run through the cases yourself before describing them as your own testing.

To practice manually, number the squares 1–9 from left to right, top to bottom:

- X win: 1, 4, 2, 5, 3.
- O win: 1, 4, 2, 5, 9, 6.
- Draw: 1, 2, 3, 5, 4, 6, 8, 7, 9.
- Ninth-move win: 1, 2, 3, 4, 5, 6, 8, 7, 9.
- Change colors after two moves. The marks and next player should stay the same.
- Restart. The board should clear, X should move first, and the theme should stay selected.
- Choose 30 seconds each. Before starting, neither clock should run and the board should be disabled.
- Start, wait a few seconds, and move. X's clock should freeze while O's runs. On X's next turn it should resume from its saved balance.
- Change colors during a timed round. The active clock should keep counting.
- Let a clock expire. The other player should win and all squares should be disabled.
- Restart a timed round. Both clocks should reset and wait for the start button.

## How does the timer work?

Selecting a clock resets the board and gives each player 30 or 60 seconds. It does not start counting until both players are ready and the start button is clicked. Each budget covers all of that player's turns, not each individual move.

`deadline` is a ref containing the time when the active player would run out. Starting the clock sets it to `performance.now()` plus that player's remaining milliseconds. Unlike state, changing a ref does not trigger a render; here it holds a timing value used by the event handler and interval.

`useEffect` sets up an interval while the game is running. Every 100 milliseconds it subtracts the current time from the deadline and updates the active player's remaining time in state. The UI rounds up to whole seconds. Using a deadline avoids relying on perfectly punctual interval callbacks, which can be delayed when a tab is in the background.

After a move, the current player's balance is saved and the deadline switches to the other player's remaining budget. A zero balance ends the game. The click handler also checks the deadline, so an expired player cannot squeeze in a move before the next display update.

The Effect returns `clearInterval` as cleanup. React runs that cleanup before setting up the Effect again when its dependencies change, or when the component is removed. This stops the old player's interval on a turn change and stops ticking after a win, draw, reset, or timeout. Without cleanup, multiple intervals could keep updating the clocks.

The functional form `setRemaining(previous => ...)` starts with the latest state and replaces just the active player's balance. The other player's saved time stays intact.

## What would you add next?

A match score could count X wins, O wins, and draws across rounds. It would need separate state so restarting a round does not clear the match score.

## Before the interview

Run the app, follow a click through the four components, and try changing one theme color yourself. Be ready to distinguish your feature decisions from the tutorial's pattern and the implementation help. There is no need to claim you wrote every line unaided.
