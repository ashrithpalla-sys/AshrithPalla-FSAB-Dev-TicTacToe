import { useEffect, useRef, useState } from 'react';

const themes = ['Paper', 'Ocean', 'Berry'];

function ThemePicker({ theme, onThemeChange }) {
  return (
    <fieldset className="theme-picker">
      <legend>Pick your colors</legend>
      <div className="theme-options">
        {themes.map((name) => (
          <button
            key={name}
            className="theme-option"
            aria-pressed={theme === name}
            onClick={() => onThemeChange(name)}
          >
            <span className={`swatch swatch-${name.toLowerCase()}`} aria-hidden="true" />
            {name}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function PlayerClocks({ remaining, currentPlayer, running }) {
  return (
    <div className="clocks" aria-label="Player clocks">
      {['X', 'O'].map((player) => (
        <div
          key={player}
          className={`clock ${running && currentPlayer === player ? 'clock-active' : ''}`}
        >
          <span>{player} <span className="clock-label">{running && currentPlayer === player ? 'playing' : 'time'}</span></span>
          <strong className={remaining[player] <= 10000 ? 'time-low' : ''}>
            {Math.ceil(remaining[player] / 1000)}<small>s</small>
          </strong>
        </div>
      ))}
    </div>
  );
}

function Square({ value, index, isWinning, disabled, onClick }) {
  return (
    <button
      className={`square ${value === 'O' ? 'mark-o' : 'mark-x'} ${isWinning ? 'winning' : ''}`}
      aria-label={`Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}: ${value || 'empty'}`}
      disabled={disabled}
      onClick={onClick}
    >
      {value}
    </button>
  );
}

function Board({ squares, winningLine, gameOver, onPlay }) {
  return (
    <div className="board" role="group" aria-label="Tic tac toe board">
      {squares.map((value, index) => (
        <Square
          key={index}
          value={value}
          index={index}
          isWinning={winningLine.includes(index)}
          disabled={gameOver || value !== null}
          onClick={() => onPlay(index)}
        />
      ))}
    </div>
  );
}

// Check the three rows, three columns, and two diagonals.
function findWinningLine(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a, b, c];
    }
  }
  return [];
}

export default function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [theme, setTheme] = useState('Paper');
  const [timeLimit, setTimeLimit] = useState(0);
  const [remaining, setRemaining] = useState({ X: 0, O: 0 });
  const [started, setStarted] = useState(false);
  const deadline = useRef(0);
  const timed = timeLimit > 0;
  const winningLine = findWinningLine(squares);
  const winner = winningLine.length > 0 ? squares[winningLine[0]] : null;
  let timedOutPlayer = null;
  if (timed && started) {
    if (remaining.X <= 0) timedOutPlayer = 'X';
    else if (remaining.O <= 0) timedOutPlayer = 'O';
  }
  const isDraw = !winner && squares.every((square) => square !== null);
  const gameOver = Boolean(winner) || isDraw || Boolean(timedOutPlayer);
  const currentPlayer = xIsNext ? 'X' : 'O';

  useEffect(() => {
    if (!timed || !started || gameOver) return;

    const interval = setInterval(() => {
      // Measure actual elapsed time, even if a background tab delays a tick.
      const timeLeft = Math.max(0, deadline.current - performance.now());
      setRemaining((previous) => ({ ...previous, [currentPlayer]: timeLeft }));
    }, 100);

    return () => clearInterval(interval);
  }, [timed, started, gameOver, currentPlayer]);

  let status = `${currentPlayer}'s turn`;
  if (winner) status = `${winner} wins!`;
  else if (timedOutPlayer) status = `${timedOutPlayer === 'X' ? 'O' : 'X'} wins on time!`;
  else if (isDraw) status = "It's a draw!";
  else if (timed && !started) status = 'Ready to play?';

  let hint = 'Take turns picking an empty square.';
  if (timedOutPlayer) hint = `${timedOutPlayer} ran out of time.`;
  else if (gameOver) hint = 'Another round?';
  else if (timed && !started) hint = 'Start the clock when both players are ready.';

  let buttonText = 'Restart game';
  if (timed && !started) buttonText = 'Start timed game';
  else if (gameOver) buttonText = 'Play again';

  function handlePlay(index) {
    if (squares[index] || gameOver || (timed && !started)) return;

    if (timed) {
      const timeLeft = Math.max(0, deadline.current - performance.now());
      setRemaining((previous) => ({ ...previous, [currentPlayer]: timeLeft }));
      // Also check on click so a move cannot slip in between timer updates.
      if (timeLeft === 0) return;
      const nextPlayer = xIsNext ? 'O' : 'X';
      deadline.current = performance.now() + remaining[nextPlayer];
    }

    // Copy the array instead of changing React's existing state.
    const nextSquares = squares.slice();
    nextSquares[index] = currentPlayer;
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  function resetGame(limit) {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setRemaining({ X: limit * 1000, O: limit * 1000 });
    setStarted(false);
    deadline.current = 0;
  }

  function changeTimeLimit(event) {
    const limit = Number(event.target.value);
    setTimeLimit(limit);
    resetGame(limit);
  }

  function startClock() {
    deadline.current = performance.now() + timeLimit * 1000;
    setStarted(true);
  }

  function handleGameButton() {
    if (timed && !started) startClock();
    else resetGame(timeLimit);
  }

  return (
    <main className="page" data-theme={theme}>
      <header>
        <p className="eyebrow">A little study break</p>
        <h1>Tic Tac Toe<span aria-hidden="true">.</span></h1>
        <p className="intro">Grab a friend. Get three in a row.</p>
      </header>

      <section className="game" aria-label="Two-player game">
        <div className="time-control">
          <label htmlFor="time-limit">Game clock</label>
          <select id="time-limit" value={timeLimit} onChange={changeTimeLimit}>
            <option value={0}>No clock</option>
            <option value={30}>30 seconds each</option>
            <option value={60}>60 seconds each</option>
          </select>
        </div>
        <p className="clock-note">Changing the clock starts a fresh round.</p>
        {timed && (
          <PlayerClocks
            remaining={remaining}
            currentPlayer={currentPlayer}
            running={started && !gameOver}
          />
        )}
        <div className="game-heading">
          <p className="status" role="status">{status}</p>
          <span className="player-note">2 players · X starts</span>
        </div>
        <Board
          squares={squares}
          winningLine={winningLine}
          gameOver={gameOver || (timed && !started)}
          onPlay={handlePlay}
        />
        <p className="hint">{hint}</p>
        <button className="restart" onClick={handleGameButton}>
          {buttonText}
        </button>
        <ThemePicker theme={theme} onThemeChange={setTheme} />
      </section>

      <footer>Ashrith Palla <span aria-hidden="true">/</span> FSAB Developer Project</footer>
    </main>
  );
}
