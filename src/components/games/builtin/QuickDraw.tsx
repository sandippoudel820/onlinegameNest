import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { Play, RotateCcw, Trophy, Zap, Crosshair, AlertTriangle } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

type RoundStatus =
  | 'idle'
  | 'countdown'
  | 'waiting' // Tension build-up, must NOT press!
  | 'fake_signal' // "WAIT!", "HOLD IT!"
  | 'go' // "FIRE! / GO!" - press now!
  | 'round_result'
  | 'match_over';

export const QuickDraw: React.FC<Props> = ({ onScoreUpdate }) => {
  const [status, setStatus] = useState<RoundStatus>('idle');
  const [signalText, setSignalText] = useState('READY?');
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [round, setRound] = useState(1);
  const [p1Reaction, setP1Reaction] = useState<number | null>(null);
  const [p2Reaction, setP2Reaction] = useState<number | null>(null);
  const [roundMessage, setRoundMessage] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  const goTimestampRef = useRef<number>(0);
  const timerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const roundResolvedRef = useRef(false);

  const TARGET_WINS = 3; // Best of 5

  const clearAllTimers = () => {
    if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
    if (fakeTimeoutRef.current) clearTimeout(fakeTimeoutRef.current);
  };

  // Start a round
  const startRound = useCallback(() => {
    sound.unlockMobileAudio();
    clearAllTimers();
    roundResolvedRef.current = false;
    setP1Reaction(null);
    setP2Reaction(null);
    setRoundMessage(null);
    setStatus('countdown');
    setSignalText('3');
    sound.playCountdownBeep(false);

    let count = 3;
    const countInterval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setSignalText(count.toString());
        sound.playCountdownBeep(false);
      } else {
        clearInterval(countInterval);
        triggerWaitingPhase();
      }
    }, 700);
  }, []);

  const triggerWaitingPhase = () => {
    setStatus('waiting');
    setSignalText('WAIT...');

    // Random choice: 40% chance of a fake signal before the real GO!
    const hasFake = Math.random() < 0.45;
    const fakeDelay = 1000 + Math.random() * 1400;
    const realDelay = hasFake ? fakeDelay + 1400 + Math.random() * 1500 : 1500 + Math.random() * 2500;

    if (hasFake) {
      fakeTimeoutRef.current = setTimeout(() => {
        if (roundResolvedRef.current) return;
        setStatus('fake_signal');
        const fakes = ['WAIT!', 'HOLD IT!', 'NOT YET!', 'HOLD ON!'];
        setSignalText(fakes[Math.floor(Math.random() * fakes.length)]);
        sound.playBounce();
      }, fakeDelay);
    }

    timerTimeoutRef.current = setTimeout(() => {
      if (roundResolvedRef.current) return;
      triggerGoPhase();
    }, realDelay);
  };

  const triggerGoPhase = () => {
    setStatus('go');
    setSignalText('FIRE! ⚡');
    goTimestampRef.current = performance.now();
    sound.playLaser();
  };

  // Handle Player Trigger Action
  const handlePlayerTrigger = useCallback(
    (player: 1 | 2) => {
      sound.unlockMobileAudio();
      if (status === 'round_result' || status === 'match_over' || roundResolvedRef.current) return;

      const now = performance.now();

      // Case 1: Early Draw during Countdown, Waiting, or Fake Signal -> FOUL! Instant round loss!
      if (status === 'countdown' || status === 'waiting' || status === 'fake_signal') {
        roundResolvedRef.current = true;
        clearAllTimers();
        sound.playFoul();

        if (player === 1) {
          setP2Score((s) => {
            const next = s + 1;
            checkMatchOver(p1Score, next);
            return next;
          });
          setRoundMessage('Player 1 Drew Early! FOUL! Player 2 Wins Round!');
        } else {
          setP1Score((s) => {
            const next = s + 1;
            checkMatchOver(next, p2Score);
            return next;
          });
          setRoundMessage('Player 2 Drew Early! FOUL! Player 1 Wins Round!');
        }
        setStatus('round_result');
        return;
      }

      // Case 2: Legal Draw on GO!
      if (status === 'go') {
        const reactionMs = Math.round(now - goTimestampRef.current);
        sound.playMachineGun();

        if (player === 1) {
          setP1Reaction(reactionMs);
          if (p2Reaction === null) {
            // Player 1 drew first!
            roundResolvedRef.current = true;
            sound.playScore();
            setP1Score((s) => {
              const next = s + 1;
              checkMatchOver(next, p2Score);
              return next;
            });
            setRoundMessage(`Player 1 drew in ${reactionMs} ms! Winner! ⚡`);
            setStatus('round_result');
          }
        } else {
          setP2Reaction(reactionMs);
          if (p1Reaction === null) {
            // Player 2 drew first!
            roundResolvedRef.current = true;
            sound.playScore();
            setP2Score((s) => {
              const next = s + 1;
              checkMatchOver(p1Score, next);
              return next;
            });
            setRoundMessage(`Player 2 drew in ${reactionMs} ms! Winner! ⚡`);
            setStatus('round_result');
          }
        }
      }
    },
    [status, p1Score, p2Score, p1Reaction, p2Reaction]
  );

  const checkMatchOver = (s1: number, s2: number) => {
    if (s1 >= TARGET_WINS) {
      setWinner('Player 1 Wins the Showdown! 🏆');
      setStatus('match_over');
      sound.playWin();
      onScoreUpdate?.(s1 * 150);
    } else if (s2 >= TARGET_WINS) {
      setWinner('Player 2 Wins the Showdown! 🏆');
      setStatus('match_over');
      sound.playWin();
      onScoreUpdate?.(s2 * 150);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // P1: A, W, Space, F
      if (['a', 'A', 'w', 'W', 'f', 'F', ' '].includes(e.key) || e.code === 'Space') {
        e.preventDefault();
        handlePlayerTrigger(1);
      }
      // P2: Enter, ArrowDown, ArrowRight, L
      if (['Enter', 'ArrowDown', 'ArrowRight', 'l', 'L'].includes(e.key)) {
        e.preventDefault();
        handlePlayerTrigger(2);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayerTrigger]);

  const resetMatch = () => {
    clearAllTimers();
    setP1Score(0);
    setP2Score(0);
    setRound(1);
    setWinner(null);
    setRoundMessage(null);
    startRound();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-2 sm:p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[560px] flex items-center justify-between mb-2 px-4 py-2 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 text-sm shadow">
        {/* P1 Score */}
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50" />
          <span className="font-bold text-cyan-400">P1:</span>
          <span className="font-mono text-xl font-black text-white">{p1Score}</span>
        </div>

        {/* Round Counter */}
        <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
          <span>First to {TARGET_WINS} Wins</span>
        </div>

        {/* P2 Score */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xl font-black text-white">{p2Score}</span>
          <span className="font-bold text-rose-400">:P2</span>
          <div className="w-3.5 h-3.5 rounded-full bg-rose-400 shadow-md shadow-rose-400/50" />
        </div>
      </div>

      {/* Main Duel Screen */}
      <div
        className={`relative w-full max-w-[560px] aspect-[16/10] max-h-[380px] rounded-2xl overflow-hidden shadow-2xl border-2 transition-colors duration-200 flex flex-col items-center justify-center p-6 ${
          status === 'go'
            ? 'bg-emerald-950/80 border-emerald-400 shadow-emerald-500/20'
            : status === 'fake_signal'
            ? 'bg-rose-950/80 border-rose-500 shadow-rose-500/20'
            : status === 'waiting'
            ? 'bg-amber-950/70 border-amber-500/60'
            : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        {/* Idle Menu */}
        {status === 'idle' && (
          <div className="flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 mb-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/20">
              <Zap className="w-8 h-8 fill-current" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-wide mb-1">
              QUICK DRAW
            </h2>
            <p className="text-xs text-slate-300 max-w-sm mb-5">
              Wait for <span className="text-emerald-400 font-bold">FIRE!</span> then press your button instantly. Watch out for fake signals like <span className="text-rose-400 font-bold">WAIT!</span> — early trigger causes instant loss!
            </p>
            <div className="flex items-center gap-8 text-xs text-slate-400 mb-6">
              <div className="flex flex-col items-center">
                <span className="text-cyan-400 font-bold mb-1">Player 1</span>
                <span className="font-mono bg-slate-800 px-2.5 py-1 rounded border border-slate-700">Space / A / W</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-rose-400 font-bold mb-1">Player 2</span>
                <span className="font-mono bg-slate-800 px-2.5 py-1 rounded border border-slate-700">Enter / Down / L</span>
              </div>
            </div>
            <button
              onClick={startRound}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-extrabold rounded-xl shadow-lg transition-transform transform active:scale-95 text-sm"
            >
              START DUEL
            </button>
          </div>
        )}

        {/* Live Signal Display */}
        {(status === 'countdown' || status === 'waiting' || status === 'fake_signal' || status === 'go') && (
          <div className="flex flex-col items-center justify-center text-center">
            <span
              className={`font-black tracking-wider transition-all duration-100 ${
                status === 'go'
                  ? 'text-7xl sm:text-8xl text-emerald-400 animate-bounce'
                  : status === 'fake_signal'
                  ? 'text-6xl sm:text-7xl text-rose-400 animate-pulse'
                  : status === 'waiting'
                  ? 'text-5xl sm:text-6xl text-amber-300'
                  : 'text-7xl text-cyan-400 animate-ping'
              }`}
            >
              {signalText}
            </span>
            {status === 'waiting' && (
              <span className="text-xs text-amber-400/80 mt-4 tracking-widest uppercase font-semibold">
                Do NOT press early!
              </span>
            )}
            {status === 'fake_signal' && (
              <span className="text-xs text-rose-300 mt-4 tracking-widest uppercase font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> FAKE SIGNAL — HOLD!
              </span>
            )}
          </div>
        )}

        {/* Round Result Overlay */}
        {status === 'round_result' && (
          <div className="flex flex-col items-center text-center animate-fade-in">
            <Crosshair className="w-12 h-12 text-cyan-400 mb-2" />
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{roundMessage}</h3>
            <div className="flex items-center gap-6 text-xs text-slate-300 mb-5 font-mono">
              {p1Reaction && <span>P1: {p1Reaction} ms</span>}
              {p2Reaction && <span>P2: {p2Reaction} ms</span>}
            </div>
            <button
              onClick={() => {
                setRound((r) => r + 1);
                startRound();
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-rose-500 hover:from-cyan-400 hover:to-rose-400 text-white font-bold rounded-xl shadow text-xs transition"
            >
              NEXT ROUND
            </button>
          </div>
        )}

        {/* Match Over Overlay */}
        {status === 'match_over' && (
          <div className="flex flex-col items-center text-center animate-fade-in">
            <Trophy className="w-14 h-14 text-amber-400 mb-2" />
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">{winner}</h3>
            <p className="text-xs text-slate-300 mb-5">
              Final Score: <span className="text-cyan-400 font-bold font-mono">{p1Score}</span> -{' '}
              <span className="text-rose-400 font-bold font-mono">{p2Score}</span>
            </p>
            <button
              onClick={resetMatch}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-extrabold rounded-xl shadow-lg transition-transform transform active:scale-95 text-xs"
            >
              PLAY REMATCH
            </button>
          </div>
        )}
      </div>

      {/* Dual Mobile Action Buttons */}
      <div className="w-full max-w-[560px] flex items-center justify-between gap-4 mt-3 px-2">
        {/* Player 1 Draw Button */}
        <button
          onClick={() => handlePlayerTrigger(1)}
          className="flex-1 py-4 sm:py-5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 active:from-cyan-700 active:to-blue-700 active:scale-95 text-white font-black flex flex-col items-center justify-center gap-1 shadow-lg shadow-cyan-500/20 text-sm transition touch-none"
        >
          <span className="text-[10px] text-cyan-200 tracking-wider">PLAYER 1</span>
          <span className="text-base sm:text-lg">DRAW / FIRE!</span>
        </button>

        {/* Reset button */}
        <button
          onClick={resetMatch}
          className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition shadow"
          title="Reset Match"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Player 2 Draw Button */}
        <button
          onClick={() => handlePlayerTrigger(2)}
          className="flex-1 py-4 sm:py-5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 active:from-rose-700 active:to-amber-700 active:scale-95 text-white font-black flex flex-col items-center justify-center gap-1 shadow-lg shadow-rose-500/20 text-sm transition touch-none"
        >
          <span className="text-[10px] text-rose-200 tracking-wider">PLAYER 2</span>
          <span className="text-base sm:text-lg">DRAW / FIRE!</span>
        </button>
      </div>
    </div>
  );
};
