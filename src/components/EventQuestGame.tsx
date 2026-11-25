import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, X, Trophy } from 'lucide-react';

type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

interface FallingItem {
  x: number;
  y: number;
  vy: number;
  kind: 'kamera' | 'mic' | 'baju' | 'kalender' | 'tiket' | 'storm';
  size: number;
  rotation: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}

interface EventQuestGameProps {
  isOpen: boolean;
  bestScore: number;
  onClose: () => void;
  onCompleteRound: (score: number, maxCombo: number) => void;
}

const ITEM_COLORS: Record<FallingItem['kind'], string> = {
  kamera: '#377EC0',
  mic: '#F7891F',
  baju: '#F04F52',
  kalender: '#5460AC',
  tiket: '#FBDF54',
  storm: '#475569',
};

const ITEM_LABELS: Record<FallingItem['kind'], string> = {
  kamera: 'CAM',
  mic: 'MIC',
  baju: 'TEE',
  kalender: 'CAL',
  tiket: 'TIX',
  storm: '!',
};

export const EventQuestGame: React.FC<EventQuestGameProps> = ({
  isOpen,
  bestScore,
  onClose,
  onCompleteRound,
}) => {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [hudScore, setHudScore] = useState(0);
  const [hudCombo, setHudCombo] = useState(0);
  const [hudMaxCombo, setHudMaxCombo] = useState(0);
  const [hudTime, setHudTime] = useState(40);
  const [muted, setMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Mutable simulation state decoupled from React renders
  const simRef = useRef({
    playerX: 300,
    playerW: 84,
    squash: 1,
    dashTimer: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    timeLeft: 40,
    spawnTimer: 0,
    shake: 0,
    items: [] as FallingItem[],
    particles: [] as Particle[],
    texts: [] as FloatingText[],
    heldKeys: {} as Record<string, boolean>,
    pointerX: null as number | null,
    reported: false,
  });

  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType = 'triangle') => {
      if (muted) return;
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContext();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        // Ignore audio context errors in restricted environments
      }
    },
    [muted]
  );

  const resetAndStart = useCallback(() => {
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 640;
    simRef.current = {
      playerX: width / 2,
      playerW: 88,
      squash: 1,
      dashTimer: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      timeLeft: 40,
      spawnTimer: 0.3,
      shake: 0,
      items: [],
      particles: [],
      texts: [],
      heldKeys: {},
      pointerX: null,
      reported: false,
    };
    setHudScore(0);
    setHudCombo(0);
    setHudMaxCombo(0);
    setHudTime(40);
    setGameState('PLAYING');
    playTone(523.25, 0.14);
  }, [playTone]);

  // Keyboard listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGameState((prev) =>
          prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev
        );
        return;
      }
      if ((e.key === 'Enter' || e.key === ' ') && gameState === 'TITLE_MENU') {
        e.preventDefault();
        resetAndStart();
        return;
      }
      if (e.key === ' ' && gameState === 'PLAYING') {
        e.preventDefault();
        if (simRef.current.dashTimer <= 0) {
          simRef.current.dashTimer = 0.18;
          playTone(660, 0.08, 'sine');
        }
      }
      simRef.current.heldKeys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      simRef.current.heldKeys[e.key.toLowerCase()] = false;
    };

    const handleBlur = () => {
      simRef.current.heldKeys = {};
      simRef.current.pointerX = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isOpen, gameState, resetAndStart, playTone]);

  // 60fps Canvas Loop
  useEffect(() => {
    if (!isOpen) return;

    let animId = 0;
    let lastTime = performance.now();
    let hudSyncAcc = 0;

    const loop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const sim = simRef.current;

        if (gameState === 'PLAYING') {
          sim.timeLeft = Math.max(0, sim.timeLeft - dt);
          if (sim.timeLeft <= 0 && !sim.reported) {
            sim.reported = true;
            setHudScore(sim.score);
            setHudMaxCombo(sim.maxCombo);
            setHudTime(0);
            setGameState('GAME_OVER');
            onCompleteRound(sim.score, sim.maxCombo);
            playTone(784, 0.25);
          }

          // Player Movement
          const speed = sim.dashTimer > 0 ? 780 : 440;
          if (sim.dashTimer > 0) sim.dashTimer = Math.max(0, sim.dashTimer - dt);

          const left = sim.heldKeys['arrowleft'] || sim.heldKeys['a'];
          const right = sim.heldKeys['arrowright'] || sim.heldKeys['d'];
          if (left) sim.playerX -= speed * dt;
          if (right) sim.playerX += speed * dt;
          if (sim.pointerX !== null) {
            sim.playerX += (sim.pointerX - sim.playerX) * Math.min(1, dt * 14);
          }
          sim.playerX = Math.max(sim.playerW / 2 + 8, Math.min(canvas.width - sim.playerW / 2 - 8, sim.playerX));

          // Recover squash & shake
          sim.squash += (1 - sim.squash) * Math.min(1, dt * 12);
          sim.shake = Math.max(0, sim.shake - dt * 28);

          // Spawn items
          sim.spawnTimer -= dt;
          if (sim.spawnTimer <= 0) {
            const elapsed = 40 - sim.timeLeft;
            const interval = Math.max(0.28, 0.72 - elapsed * 0.009);
            sim.spawnTimer = interval;
            const roll = Math.random();
            const kinds: FallingItem['kind'][] = ['kamera', 'mic', 'baju', 'kalender', 'tiket'];
            const kind: FallingItem['kind'] =
              roll < 0.22 ? 'storm' : kinds[Math.floor(Math.random() * kinds.length)];
            sim.items.push({
              x: 34 + Math.random() * (canvas.width - 68),
              y: -26,
              vy: (185 + elapsed * 4.5 + Math.random() * 65),
              kind,
              size: kind === 'storm' ? 36 : 38,
              rotation: (Math.random() - 0.5) * 0.4,
            });
          }

          // Update falling items & collisions
          const playerY = canvas.height - 64;
          const nextItems: FallingItem[] = [];
          for (const item of sim.items) {
            item.y += item.vy * dt;
            const dx = Math.abs(item.x - sim.playerX);
            const dy = Math.abs(item.y - playerY);

            if (dx < sim.playerW * 0.54 && dy < 32) {
              if (item.kind === 'storm') {
                sim.combo = 0;
                sim.score = Math.max(0, sim.score - 15);
                sim.shake = 10;
                sim.squash = 0.78;
                playTone(150, 0.16, 'sawtooth');
                sim.texts.push({ x: item.x, y: playerY - 24, text: '-15!', life: 0.7, color: '#F04F52' });
              } else {
                sim.combo += 1;
                sim.maxCombo = Math.max(sim.maxCombo, sim.combo);
                const mult = sim.combo >= 10 ? 3 : sim.combo >= 5 ? 2 : 1;
                const pts = 10 * mult;
                sim.score += pts;
                sim.squash = 1.24;
                playTone(440 + Math.min(400, sim.combo * 24), 0.1, 'triangle');
                sim.texts.push({
                  x: item.x,
                  y: playerY - 26,
                  text: `+${pts}${mult > 1 ? ` x${mult}` : ''}`,
                  life: 0.75,
                  color: '#377EC0',
                });
                for (let p = 0; p < 7; p++) {
                  sim.particles.push({
                    x: item.x,
                    y: playerY - 8,
                    vx: (Math.random() - 0.5) * 190,
                    vy: -60 - Math.random() * 140,
                    life: 0.45,
                    color: ITEM_COLORS[item.kind],
                  });
                }
              }
              continue;
            }

            if (item.y < canvas.height + 40) {
              nextItems.push(item);
            }
          }
          sim.items = nextItems;

          // Update particles & floating texts
          sim.particles = sim.particles
            .map((p) => ({
              ...p,
              x: p.x + p.vx * dt,
              y: p.y + p.vy * dt,
              vy: p.vy + 340 * dt,
              life: p.life - dt,
            }))
            .filter((p) => p.life > 0);

          sim.texts = sim.texts
            .map((t) => ({ ...t, y: t.y - 45 * dt, life: t.life - dt }))
            .filter((t) => t.life > 0);

          hudSyncAcc += dt;
          if (hudSyncAcc >= 0.08) {
            hudSyncAcc = 0;
            setHudScore(sim.score);
            setHudCombo(sim.combo);
            setHudTime(Math.ceil(sim.timeLeft));
          }
        }

        // RENDER FRAME
        if (ctx) {
          ctx.save();
          if (sim.shake > 0) {
            ctx.translate((Math.random() - 0.5) * sim.shake, (Math.random() - 0.5) * sim.shake);
          }

          // Bright Blue Sky & Meadow Background
          const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          skyGrad.addColorStop(0, '#9FD2D6');
          skyGrad.addColorStop(0.65, '#E8F5FA');
          skyGrad.addColorStop(1, '#BBF7D0');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Soft Clouds
          ctx.fillStyle = 'rgba(255,255,255,0.75)';
          ctx.beginPath();
          ctx.arc(120, 90, 28, 0, Math.PI * 2);
          ctx.arc(150, 86, 34, 0, Math.PI * 2);
          ctx.arc(182, 92, 24, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(490, 130, 24, 0, Math.PI * 2);
          ctx.arc(520, 124, 30, 0, Math.PI * 2);
          ctx.arc(548, 132, 22, 0, Math.PI * 2);
          ctx.fill();

          // Meadow Hill Ground
          ctx.fillStyle = '#12BAAA';
          ctx.fillRect(0, canvas.height - 36, canvas.width, 36);

          // Falling Event Items
          for (const item of sim.items) {
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rotation);
            const r = item.size / 2;

            ctx.fillStyle = ITEM_COLORS[item.kind];
            ctx.beginPath();
            ctx.roundRect(-r, -r, item.size, item.size, 11);
            ctx.fill();

            ctx.lineWidth = 3;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();

            ctx.fillStyle = item.kind === 'tiket' ? '#0F172A' : '#FFFFFF';
            ctx.font = '700 11px "Pixelify Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ITEM_LABELS[item.kind], 0, 1);
            ctx.restore();
          }

          // Particles
          for (const p of sim.particles) {
            ctx.globalAlpha = Math.max(0, p.life * 2);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;

          // Player EVORA Mascot Cart
          const py = canvas.height - 62;
          ctx.save();
          ctx.translate(sim.playerX, py);
          ctx.scale(sim.squash, 2 - sim.squash);

          // Cart Base
          ctx.fillStyle = '#377EC0';
          ctx.beginPath();
          ctx.roundRect(-sim.playerW / 2, -16, sim.playerW, 34, 14);
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#FFFFFF';
          ctx.stroke();

          // Cute Eyes on Cart
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(-14, -2, 4, 0, Math.PI * 2);
          ctx.arc(14, -2, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0F172A';
          ctx.beginPath();
          ctx.arc(-14, -2, 2, 0, Math.PI * 2);
          ctx.arc(14, -2, 2, 0, Math.PI * 2);
          ctx.fill();

          // Flame aura when combo >= 5
          if (sim.combo >= 5) {
            ctx.fillStyle = '#FBDF54';
            ctx.font = '700 11px "Pixelify Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`STREAK x${sim.combo}!`, 0, -24);
          }

          ctx.restore();

          // Floating Score Texts
          for (const t of sim.texts) {
            ctx.globalAlpha = Math.min(1, t.life * 1.5);
            ctx.fillStyle = t.color;
            ctx.font = '700 16px "Pixelify Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(t.text, t.x, t.y);
          }
          ctx.globalAlpha = 1;
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, gameState, onCompleteRound, playTone]);

  if (!isOpen) return null;

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    simRef.current.pointerX = (e.clientX - rect.left) * scaleX;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F172A]/90 flex items-center justify-center p-2 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="EVORA Panitia Rush Mini-Game"
    >
      <div className="relative w-full max-w-3xl aspect-[4/3] max-h-[88vh] rounded-[28px] overflow-hidden bg-[#E8F5FA] shadow-2xl border-4 border-white">
        {/* Isolated Canvas Playfield */}
        <canvas
          ref={canvasRef}
          width={680}
          height={510}
          onPointerDown={handlePointerMove}
          onPointerMove={handlePointerMove}
          onPointerUp={() => {
            simRef.current.pointerX = null;
          }}
          className="w-full h-full block touch-none select-none cursor-crosshair"
        />

        {/* Minimal Perimeter HUD Overlay (pointer-events: none wrapper) */}
        <div className="absolute inset-x-0 top-0 p-3 sm:p-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/95 shadow-sm border border-[#9FD2D6] font-pixel text-sm text-[#377EC0] tabular-nums">
              SKOR {hudScore}
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-[#FBDF54] shadow-sm font-pixel text-sm text-slate-900 tabular-nums">
              STREAK {hudCombo}
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/95 shadow-sm border border-[#9FD2D6] font-pixel text-sm text-[#F04F52] tabular-nums">
              {hudTime}s
            </div>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Aktifkan suara' : 'Bisukan suara'}
              className="w-9 h-9 rounded-xl bg-white/95 text-slate-700 shadow-sm flex items-center justify-center cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            {gameState === 'PLAYING' && (
              <button
                type="button"
                onClick={() => setGameState('PAUSED')}
                aria-label="Jeda game"
                className="w-9 h-9 rounded-xl bg-white/95 text-slate-700 shadow-sm flex items-center justify-center cursor-pointer"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup game"
              className="w-9 h-9 rounded-xl bg-slate-900 text-white shadow-sm flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TITLE SCREEN */}
        {gameState === 'TITLE_MENU' && (
          <div className="absolute inset-0 bg-[#E8F5FA]/80 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#377EC0] text-white text-xs font-extrabold">
                REKOR TERBAIK: {bestScore}
              </div>
              <h2 className="font-pixel text-3xl sm:text-5xl text-slate-900 leading-tight">
                EVORA: Panitia Rush!
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                Tangkap perlengkapan event (Kamera, Mic, Baju, Kalender, Tiket) untuk membangun combo streak dan membuka maskot baru! Hindari awan badai.
              </p>
              <button
                type="button"
                onClick={resetAndStart}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#377EC0] hover:bg-[#5460AC] text-white font-pixel text-lg shadow-xl shadow-[#377EC0]/30 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                Mulai Quest
              </button>
              <p className="text-[11px] font-bold text-slate-500">
                A / D atau Panah Geser · Spasi Dash · Sentuh/Geser di Mobile · Esc Jeda
              </p>
            </div>
          </div>
        )}

        {/* PAUSED MODAL */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl">
              <h3 className="font-pixel text-2xl text-slate-900">Permainan Dijeda</h3>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setGameState('PLAYING')}
                  className="w-full py-3 rounded-xl bg-[#377EC0] text-white text-sm font-extrabold cursor-pointer"
                >
                  Lanjutkan
                </button>
                <button
                  type="button"
                  onClick={resetAndStart}
                  className="w-full py-3 rounded-xl bg-slate-100 text-slate-800 text-sm font-extrabold cursor-pointer"
                >
                  Ulangi Ronde
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-xs font-bold text-slate-500 cursor-pointer"
                >
                  Kembali ke EVORA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER / ROUND SUMMARY */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-slate-900/55 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-[#9FD2D6]">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FBDF54] text-slate-900 flex items-center justify-center">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#377EC0]">
                  Ronde Selesai!
                </p>
                <h3 className="font-pixel text-3xl text-slate-900 mt-1 tabular-nums">
                  Skor: {hudScore}
                </h3>
                <p className="text-xs font-bold text-slate-600 mt-1 tabular-nums">
                  Streak Combo Tertinggi: {hudMaxCombo}x
                </p>
              </div>

              {hudScore >= 100 && (
                <div className="p-3 rounded-2xl bg-[#E6F9F7] text-[#12BAAA] text-xs font-extrabold">
                  Streak Harian Bertambah & Maskot Event Terbuka!
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={resetAndStart}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-sm font-extrabold cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Main Lagi
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-extrabold cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
