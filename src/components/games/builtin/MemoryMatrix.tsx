import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { RotateCcw, Trophy, CheckCircle2 } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

interface Card {
  id: number;
  symbol: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS = [
  { symbol: '⚡', name: 'Energy Bolt' },
  { symbol: '🚀', name: 'Starship' },
  { symbol: '🪐', name: 'Saturn Ring' },
  { symbol: '💎', name: 'Cyber Crystal' },
  { symbol: '👾', name: 'Space Invader' },
  { symbol: '🛡️', name: 'Plasma Shield' },
  { symbol: '🎯', name: 'Laser Target' },
  { symbol: '🔥', name: 'Nova Flame' },
];

export const MemoryMatrix: React.FC<Props> = ({ onScoreUpdate }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [bestMoves, setBestMoves] = useState(() => {
    return parseInt(localStorage.getItem('gamenest_memory_best') || '999', 10);
  });

  const initGame = useCallback(() => {
    const deck: Card[] = [];
    let idCounter = 0;

    SYMBOLS.forEach((item) => {
      // Add two of each
      deck.push({ id: idCounter++, symbol: item.symbol, name: item.name, isFlipped: false, isMatched: false });
      deck.push({ id: idCounter++, symbol: item.symbol, name: item.name, isFlipped: false, isMatched: false });
    });

    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setIsWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (index: number) => {
    sound.unlockMobileAudio();
    if (flippedIndices.length >= 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    sound.playBounce();
    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const card1 = updatedCards[firstIdx];
      const card2 = updatedCards[secondIdx];

      if (card1.symbol === card2.symbol) {
        // Match!
        sound.playScore();
        setTimeout(() => {
          setCards((prev) => {
            const next = [...prev];
            next[firstIdx].isMatched = true;
            next[secondIdx].isMatched = true;
            return next;
          });
          setFlippedIndices([]);
          setMatches((m) => {
            const newM = m + 1;
            if (newM === SYMBOLS.length) {
              setIsWon(true);
              sound.playScore();
              onScoreUpdate?.(1000 - (moves + 1) * 20);
              if (moves + 1 < bestMoves) {
                setBestMoves(moves + 1);
                localStorage.setItem('gamenest_memory_best', (moves + 1).toString());
              }
            }
            return newM;
          });
        }, 300);
      } else {
        // No match -> flip back
        setTimeout(() => {
          setCards((prev) => {
            const next = [...prev];
            next[firstIdx].isFlipped = false;
            next[secondIdx].isFlipped = false;
            return next;
          });
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#07090e] p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[480px] flex items-center justify-between mb-3 px-3 py-2 bg-slate-900/80 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-black text-cyan-400">MEMORY MATRIX CYBER</h2>
          <span className="text-[10px] text-slate-400">Pair all holographic nodes</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center">
            <span className="block text-[9px] uppercase font-semibold text-slate-400">Moves</span>
            <span className="text-sm font-bold font-mono text-cyan-400">{moves}</span>
          </div>

          <div className="text-center">
            <span className="block text-[9px] uppercase font-semibold text-slate-400">Matches</span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {matches}/{SYMBOLS.length}
            </span>
          </div>

          {bestMoves < 999 && (
            <div className="text-center hidden sm:block">
              <span className="block text-[9px] uppercase font-semibold text-slate-400">Best</span>
              <span className="text-sm font-bold font-mono text-amber-400 flex items-center gap-0.5">
                <Trophy className="w-3 h-3" /> {bestMoves}
              </span>
            </div>
          )}

          <button
            onClick={initGame}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Grid */}
      <div className="relative w-full max-w-[480px] aspect-square p-2 bg-slate-950 rounded-2xl border-2 border-cyan-500/20 shadow-2xl">
        <div className="grid grid-cols-4 gap-2 w-full h-full">
          {cards.map((card, idx) => {
            const isRevealed = card.isFlipped || card.isMatched;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(idx)}
                className={`relative flex items-center justify-center rounded-xl text-3xl font-bold transition-all duration-300 transform perspective-1000 border ${
                  card.isMatched
                    ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-500/20 text-emerald-300 opacity-80'
                    : isRevealed
                    ? 'bg-slate-800 border-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-900 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 active:scale-95'
                }`}
              >
                {isRevealed ? (
                  <span className="scale-100 animate-scale-in">{card.symbol}</span>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-cyan-500/30 flex items-center justify-center">
                    <span className="text-cyan-400/40 text-xs">◆</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Win Modal */}
        {isWon && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-2" />
            <h3 className="text-2xl font-black text-white mb-1">MATRIX SYNCHRONIZED!</h3>
            <p className="text-xs text-slate-300 mb-2">
              You cleared all pairs in <span className="font-bold text-cyan-400">{moves} moves</span>!
            </p>
            <button
              onClick={initGame}
              className="mt-3 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-400">Click cards to flip and match pairs</p>
    </div>
  );
};
