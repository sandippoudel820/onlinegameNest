import React, { useState, useEffect, useCallback, useRef } from 'react';
import { sound } from '../../../utils/audio';
import { RotateCcw, Trophy } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

type Board = number[][];

export const Puzzle2048: React.FC<Props> = ({ onScoreUpdate }) => {
  const [board, setBoard] = useState<Board>([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('gamenest_2048_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const getEmptyCells = (grid: Board) => {
    const empty: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) empty.push({ r, c });
      }
    }
    return empty;
  };

  const addRandomTile = useCallback((grid: Board) => {
    const empty = getEmptyCells(grid);
    if (empty.length === 0) return grid;
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  }, []);

  const initGame = useCallback(() => {
    let newBoard: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setHasWon(false);
  }, [addRandomTile]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const canMove = (grid: Board) => {
    if (getEmptyCells(grid).length > 0) return true;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = grid[r][c];
        if (r < 3 && grid[r + 1][c] === val) return true;
        if (c < 3 && grid[r][c + 1] === val) return true;
      }
    }
    return false;
  };

  const move = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (gameOver) return;

      let changed = false;
      let pointsEarned = 0;
      const newGrid = board.map((row) => [...row]);

      const slideAndMergeRow = (row: number[]) => {
        let arr = row.filter((v) => v !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
          if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            pointsEarned += arr[i];
            if (arr[i] === 2048) setHasWon(true);
            arr[i + 1] = 0;
          }
        }
        arr = arr.filter((v) => v !== 0);
        while (arr.length < 4) {
          arr.push(0);
        }
        return arr;
      };

      if (direction === 'left') {
        for (let r = 0; r < 4; r++) {
          const oldRow = [...newGrid[r]];
          const newRow = slideAndMergeRow(oldRow);
          newGrid[r] = newRow;
          if (oldRow.some((val, idx) => val !== newRow[idx])) changed = true;
        }
      } else if (direction === 'right') {
        for (let r = 0; r < 4; r++) {
          const oldRow = [...newGrid[r]];
          const reversed = [...oldRow].reverse();
          const merged = slideAndMergeRow(reversed).reverse();
          newGrid[r] = merged;
          if (oldRow.some((val, idx) => val !== merged[idx])) changed = true;
        }
      } else if (direction === 'up') {
        for (let c = 0; c < 4; c++) {
          const oldCol = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
          const newCol = slideAndMergeRow(oldCol);
          for (let r = 0; r < 4; r++) {
            newGrid[r][c] = newCol[r];
          }
          if (oldCol.some((val, idx) => val !== newCol[idx])) changed = true;
        }
      } else if (direction === 'down') {
        for (let c = 0; c < 4; c++) {
          const oldCol = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
          const reversed = [...oldCol].reverse();
          const newCol = slideAndMergeRow(reversed).reverse();
          for (let r = 0; r < 4; r++) {
            newGrid[r][c] = newCol[r];
          }
          if (oldCol.some((val, idx) => val !== newCol[idx])) changed = true;
        }
      }

      if (changed) {
        sound.playBounce();
        const nextBoard = addRandomTile(newGrid);
        const updatedScore = score + pointsEarned;
        setBoard(nextBoard);
        setScore(updatedScore);
        onScoreUpdate?.(updatedScore);

        if (updatedScore > highScore) {
          setHighScore(updatedScore);
          localStorage.setItem('gamenest_2048_highscore', updatedScore.toString());
        }

        if (!canMove(nextBoard)) {
          setGameOver(true);
          sound.playGameOver();
        }
      }
    },
    [board, gameOver, score, highScore, onScoreUpdate, addRandomTile]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') move('left');
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') move('right');
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') move('up');
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') move('down');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const handleTouchStart = (e: React.TouchEvent) => {
    sound.unlockMobileAudio();
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) move('right');
        else move('left');
      } else {
        if (dy > 0) move('down');
        else move('up');
      }
    }
  };

  const getTileColor = (val: number) => {
    switch (val) {
      case 2:
        return 'bg-slate-800 text-cyan-300 border-cyan-500/20';
      case 4:
        return 'bg-slate-800 text-cyan-200 border-cyan-400/30';
      case 8:
        return 'bg-cyan-900/60 text-cyan-100 border-cyan-400/50 shadow-md shadow-cyan-500/20';
      case 16:
        return 'bg-blue-900/60 text-blue-100 border-blue-400/50 shadow-md shadow-blue-500/20';
      case 32:
        return 'bg-indigo-900/70 text-indigo-100 border-indigo-400/60 shadow-md shadow-indigo-500/25';
      case 64:
        return 'bg-violet-900/70 text-violet-100 border-violet-400/60 shadow-md shadow-violet-500/30';
      case 128:
        return 'bg-amber-600 text-white border-amber-400 font-extrabold shadow-lg shadow-amber-500/30';
      case 256:
        return 'bg-amber-500 text-white border-amber-300 font-black shadow-lg shadow-amber-500/40';
      case 512:
        return 'bg-emerald-600 text-white border-emerald-300 font-black shadow-lg shadow-emerald-500/40';
      case 1024:
        return 'bg-rose-600 text-white border-rose-300 font-black shadow-lg shadow-rose-500/50';
      case 2048:
        return 'bg-gradient-to-tr from-amber-400 to-rose-500 text-white font-black shadow-xl shadow-amber-500/50 animate-pulse';
      default:
        return 'bg-purple-600 text-white font-black';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#07090e] p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[420px] flex items-center justify-between mb-3 px-3 py-2 bg-slate-900/80 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            2048 NEON
          </h2>
          <span className="text-[10px] text-slate-400">Join numbers to get 2048</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-800/80 px-2.5 py-1 rounded-lg text-center">
            <span className="block text-[9px] uppercase font-semibold text-slate-400">Score</span>
            <span className="text-base font-bold font-mono text-cyan-400">{score}</span>
          </div>

          <div className="bg-slate-800/80 px-2.5 py-1 rounded-lg text-center">
            <span className="block text-[9px] uppercase font-semibold text-slate-400">Best</span>
            <span className="text-base font-bold font-mono text-amber-400 flex items-center gap-0.5 justify-center">
              <Trophy className="w-3 h-3 text-amber-400 inline" />
              {highScore}
            </span>
          </div>

          <button
            onClick={initGame}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-[420px] aspect-square p-2 bg-slate-950 rounded-2xl border-2 border-cyan-500/20 shadow-2xl flex flex-col justify-between"
      >
        <div className="grid grid-cols-4 gap-2 w-full h-full">
          {board.map((row, rIdx) =>
            row.map((val, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`relative flex items-center justify-center rounded-xl font-mono text-xl sm:text-2xl transition-all duration-150 border ${
                  val === 0
                    ? 'bg-slate-900/40 border-slate-800/50'
                    : getTileColor(val)
                }`}
              >
                {val !== 0 && (
                  <span className="animate-scale-in drop-shadow-sm font-bold">{val}</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Game Over / Win Modal */}
        {(gameOver || hasWon) && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            {hasWon && !gameOver ? (
              <>
                <h3 className="text-3xl font-black text-amber-400 mb-2">YOU REACHED 2048!</h3>
                <p className="text-xs text-slate-300 mb-4">Legendary intellect! Keep going for higher glory.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setHasWon(false)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg"
                  >
                    CONTINUE
                  </button>
                  <button
                    onClick={initGame}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg"
                  >
                    NEW GAME
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-black text-rose-500 mb-2">NO MORE MOVES!</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Final Score: <span className="font-mono font-bold text-cyan-400">{score}</span>
                </p>
                <button
                  onClick={initGame}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> PLAY AGAIN
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Touch swipe + Optional D-Pad buttons for Android & iOS */}
      <div className="mt-2.5 flex flex-col items-center gap-1 sm:hidden">
        <button
          onClick={() => move('up')}
          className="w-14 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl text-white font-black text-base flex items-center justify-center border border-slate-700 shadow-md active:scale-95 touch-manipulation"
          aria-label="Slide Up"
        >
          ▲
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => move('left')}
            className="w-14 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl text-white font-black text-base flex items-center justify-center border border-slate-700 shadow-md active:scale-95 touch-manipulation"
            aria-label="Slide Left"
          >
            ◀
          </button>
          <button
            onClick={() => move('down')}
            className="w-14 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl text-white font-black text-base flex items-center justify-center border border-slate-700 shadow-md active:scale-95 touch-manipulation"
            aria-label="Slide Down"
          >
            ▼
          </button>
          <button
            onClick={() => move('right')}
            className="w-14 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl text-white font-black text-base flex items-center justify-center border border-slate-700 shadow-md active:scale-95 touch-manipulation"
            aria-label="Slide Right"
          >
            ▶
          </button>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-slate-500 text-center">
        Swipe directly on grid or tap buttons (iOS / Android) &bull; Arrows / WASD (Windows / Mac)
      </p>
    </div>
  );
};
