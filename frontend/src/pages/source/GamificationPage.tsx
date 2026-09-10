import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2,
  Trophy,
  Award,
  Sparkles,
  Flame,
  Heart,
  RotateCcw,
  Play,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Gift,
  TreePine,
  Truck,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

interface FallingItem {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: 'pcb' | 'copper' | 'battery' | 'hdd' | 'gold_chip' | 'hazard';
  name: string;
  points: number;
  radius: number;
  color: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  city: string;
  divertedKg: number;
  points: number;
  isCurrentUser?: boolean;
}

interface RewardItem {
  id: string;
  title: string;
  description: string;
  costPoints: number;
  icon: 'tree' | 'truck' | 'award';
  claimed?: boolean;
}

const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'rew-1',
    title: 'Plant a Native Mangrove Tree',
    description: 'We partner with SankalpTaru to plant a geo-tagged tree in the Sundarbans Delta.',
    costPoints: 300,
    icon: 'tree',
  },
  {
    id: 'rew-2',
    title: 'Priority 1-Hour Collector Dispatch',
    description: 'Instant zero-fee booking dispatch code for your next corporate e-waste lot.',
    costPoints: 500,
    icon: 'truck',
  },
  {
    id: 'rew-3',
    title: 'Framed Circular Hero Certificate',
    description: 'Official physical certificate printed on 100% recycled cotton seed paper.',
    costPoints: 900,
    icon: 'award',
  },
];

const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, name: 'Ananya Sharma', city: 'Bengaluru, KA', divertedKg: 420.5, points: 6840 },
  { rank: 2, name: 'Karthik Ramanathan', city: 'Chennai, TN', divertedKg: 388.2, points: 5920 },
  { rank: 3, name: 'TechCorp Solutions', city: 'Gurugram, HR', divertedKg: 312.0, points: 4890 },
  { rank: 4, name: 'You (Verified Source)', city: 'Your City', divertedKg: 165.4, points: 2450, isCurrentUser: true },
  { rank: 5, name: 'Vikram Joshi', city: 'Pune, MH', divertedKg: 142.1, points: 2180 },
];

const GamificationPage: React.FC = () => {
  // Points & Rewards State
  const [ecoPoints, setEcoPoints] = useState<number>(2450);
  const [rewards, setRewards] = useState<RewardItem[]>(INITIAL_REWARDS);
  const [claimedVoucher, setClaimedVoucher] = useState<{ title: string; code: string } | null>(null);

  // Game Engine State
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [gameScore, setGameScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(1);
  const [itemsCaught, setItemsCaught] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(1850);

  // Canvas Refs & Dimensions
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Game Physics State (Refs for continuous loop without closure stale state)
  const basketXRef = useRef<number>(250);
  const basketWidth = 90;
  const basketHeight = 22;
  const canvasWidth = 560;
  const canvasHeight = 420;
  const itemsRef = useRef<FallingItem[]>([]);
  const nextItemIdRef = useRef<number>(1);
  const lastSpawnRef = useRef<number>(0);
  const isMovingLeftRef = useRef<boolean>(false);
  const isMovingRightRef = useRef<boolean>(false);

  // Item Types Catalog
  const ITEM_CATALOG = [
    { type: 'pcb' as const, name: 'Motherboard PCB', points: 30, radius: 18, color: '#10b981' },
    { type: 'copper' as const, name: 'Copper Coils', points: 25, radius: 16, color: '#f97316' },
    { type: 'battery' as const, name: 'Li-Ion Battery', points: 40, radius: 15, color: '#eab308' },
    { type: 'hdd' as const, name: 'Rare Earth HDD', points: 35, radius: 17, color: '#8b5cf6' },
    { type: 'gold_chip' as const, name: '⭐ Gold Microchip', points: 100, radius: 20, color: '#f59e0b' },
    { type: 'hazard' as const, name: '⚠️ Toxic Acid Sludge', points: -1, radius: 19, color: '#ef4444' },
  ];

  // Spawn falling item
  const spawnItem = () => {
    const isHazard = Math.random() < 0.22;
    const isRareGold = !isHazard && Math.random() < 0.15;
    let template;
    if (isHazard) {
      template = ITEM_CATALOG.find((i) => i.type === 'hazard')!;
    } else if (isRareGold) {
      template = ITEM_CATALOG.find((i) => i.type === 'gold_chip')!;
    } else {
      const normalPool = ITEM_CATALOG.filter((i) => i.type !== 'hazard' && i.type !== 'gold_chip');
      template = normalPool[Math.floor(Math.random() * normalPool.length)];
    }

    const margin = template.radius + 15;
    const randomX = margin + Math.random() * (canvasWidth - margin * 2);
    const speed = 2.2 + Math.random() * 1.6 + Math.min(gameScore / 350, 3.5);

    itemsRef.current.push({
      id: nextItemIdRef.current++,
      x: randomX,
      y: -25,
      speed,
      type: template.type,
      name: template.name,
      points: template.points,
      radius: template.radius,
      color: template.color,
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        isMovingLeftRef.current = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        isMovingRightRef.current = true;
      } else if (e.key === ' ' && gameState === 'idle') {
        e.preventDefault();
        startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        isMovingLeftRef.current = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        isMovingRightRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Main Game Loop
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (gameState !== 'playing') return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Move Basket based on active keyboard inputs
      const moveSpeed = 8;
      if (isMovingLeftRef.current) {
        basketXRef.current = Math.max(basketWidth / 2, basketXRef.current - moveSpeed);
      }
      if (isMovingRightRef.current) {
        basketXRef.current = Math.min(canvasWidth - basketWidth / 2, basketXRef.current + moveSpeed);
      }

      // 2. Spawn Items periodically
      const spawnInterval = Math.max(700, 1400 - Math.min(gameScore * 1.2, 700));
      if (timestamp - lastSpawnRef.current > spawnInterval) {
        spawnItem();
        lastSpawnRef.current = timestamp;
      }

      // 3. Clear canvas with dark futuristic grid
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw cyber grid background lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvasWidth; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y < canvasHeight; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }

      // 4. Update and Render falling items
      const currentItems = [...itemsRef.current];
      const remainingItems: FallingItem[] = [];

      const basketTop = canvasHeight - 45;
      const basketLeft = basketXRef.current - basketWidth / 2;
      const basketRight = basketXRef.current + basketWidth / 2;

      for (const item of currentItems) {
        item.y += item.speed;

        // Check catch collision with basket
        const hasCollidedWithBasket =
          item.y + item.radius >= basketTop &&
          item.y - item.radius <= basketTop + basketHeight &&
          item.x >= basketLeft - 10 &&
          item.x <= basketRight + 10;

        if (hasCollidedWithBasket) {
          if (item.type === 'hazard') {
            // Hit hazard - lose life and reset combo
            setLives((prev) => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setGameState('gameover');
              }
              return newLives;
            });
            setCombo(1);
          } else {
            // Good catch!
            const addedCombo = item.type === 'gold_chip' ? 2 : 1;
            setCombo((c) => Math.min(5, c + addedCombo));
            const pointsAwarded = item.points * combo;
            setGameScore((s) => {
              const nextScore = s + pointsAwarded;
              if (nextScore > highScore) setHighScore(nextScore);
              return nextScore;
            });
            setItemsCaught((count) => count + 1);
            setEcoPoints((pts) => pts + Math.round(pointsAwarded / 2));
          }
          // Do not retain caught item
          continue;
        }

        // Check if fell off screen
        if (item.y - item.radius > canvasHeight) {
          if (item.type !== 'hazard') {
            // Missed a recyclable piece resets streak combo
            setCombo(1);
          }
          continue;
        }

        // Draw the item
        ctx.save();
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 10;
        ctx.fill();

        // Inner icon/letter
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let label = 'e';
        if (item.type === 'pcb') label = 'PCB';
        if (item.type === 'copper') label = 'Cu';
        if (item.type === 'battery') label = 'Li+';
        if (item.type === 'hdd') label = 'HD';
        if (item.type === 'gold_chip') label = 'Au';
        if (item.type === 'hazard') label = '☣';
        ctx.fillText(label, item.x, item.y);
        ctx.restore();

        remainingItems.push(item);
      }

      itemsRef.current = remainingItems;

      // 5. Render Collector Bin / Magnetic Catcher
      ctx.save();
      // Glow under basket
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 18;

      // Basket body
      const gradient = ctx.createLinearGradient(basketLeft, basketTop, basketRight, basketTop);
      gradient.addColorStop(0, '#059669');
      gradient.addColorStop(0.5, '#10b981');
      gradient.addColorStop(1, '#059669');
      ctx.fillStyle = gradient;

      // Rounded rectangle for bin
      ctx.beginPath();
      ctx.roundRect(basketLeft, basketTop, basketWidth, basketHeight, 8);
      ctx.fill();

      // Top energy line
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(basketLeft + 6, basketTop);
      ctx.lineTo(basketRight - 6, basketTop);
      ctx.stroke();

      // Text label inside bin
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡ RE-CIRCUIT BIN', basketXRef.current, basketTop + basketHeight / 2 + 1);
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    },
    [gameState, combo, gameScore, highScore]
  );

  // Start animation loop when playing
  useEffect(() => {
    if (gameState === 'playing') {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, gameLoop]);

  const startGame = () => {
    itemsRef.current = [];
    setGameScore(0);
    setLives(3);
    setCombo(1);
    setItemsCaught(0);
    basketXRef.current = canvasWidth / 2;
    lastSpawnRef.current = performance.now();
    setGameState('playing');
  };

  const handlePointerMove = (clientX: number) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const relativeX = (clientX - rect.left) * scaleX;
    basketXRef.current = Math.max(basketWidth / 2, Math.min(canvasWidth - basketWidth / 2, relativeX));
  };

  const handleClaimReward = (reward: RewardItem) => {
    if (ecoPoints < reward.costPoints) {
      alert(`You need ${reward.costPoints - ecoPoints} more Eco-Points to claim this reward!`);
      return;
    }
    setEcoPoints((prev) => prev - reward.costPoints);
    setRewards((prev) =>
      prev.map((r) => (r.id === reward.id ? { ...r, claimed: true } : r))
    );
    const voucherCode = `RC-${reward.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setClaimedVoucher({ title: reward.title, code: voucherCode });
  };

  return (
    <div className="max-container py-6 md:py-8 flex flex-col gap-6">
      <PageHeader
        eyebrow="Circular Arcade & Gamification"
        title="Eco-Sort Arcade & Points Center"
        description="Sort electronic components in real-time, hone your circular recovery reflexes, rack up multiplier streaks, and convert points into real environmental impact."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <Sparkles size={16} className="text-amber-500 animate-pulse" />
              <span>{ecoPoints.toLocaleString()} Eco-Points</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
              <Flame size={14} className="text-emerald-500" />
              <span>Rank: Eco Master Lvl 4</span>
            </div>
          </div>
        }
      />

      {/* Main Grid: Arcade Arena & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Game Canvas Container */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="card p-4 sm:p-6 bg-slate-950 text-slate-100 border-slate-800 shadow-2xl relative overflow-hidden rounded-3xl">
            {/* Header HUD inside Game Box */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">SCORE</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">{gameScore}</span>
                </div>
                <div className="border-l border-slate-800 pl-4">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">COMBO</span>
                  <span className="text-sm font-bold text-amber-400 font-mono flex items-center gap-0.5">
                    <Zap size={13} /> {combo}x MULTIPLIER
                  </span>
                </div>
              </div>

              {/* Lives Bar */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mr-1 hidden sm:inline">
                  BATTERY LIVES:
                </span>
                {[1, 2, 3].map((heartIndex) => (
                  <Heart
                    key={heartIndex}
                    size={20}
                    className={`transition-colors ${
                      heartIndex <= lives
                        ? 'fill-rose-500 text-rose-500'
                        : 'fill-slate-800 text-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Canvas Viewport */}
            <div className="relative w-full aspect-[4/3] max-h-[420px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="w-full h-full object-contain cursor-crosshair touch-none"
                onMouseMove={(e) => handlePointerMove(e.clientX)}
                onTouchMove={(e) => {
                  if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
                }}
              />

              {/* Start Overlay */}
              {gameState === 'idle' && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce">
                    <Gamepad2 size={36} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">Circuit Rush: E-Waste Arcade</h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm leading-relaxed">
                      Move your high-tech recycling bin left and right. Catch valuable circuit boards, copper, and gold chips. Avoid toxic acid sludge!
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span>Keyboard: [← / →] or [A / D]</span>
                    <span>·</span>
                    <span>Mouse / Touch: Drag horizontally</span>
                  </div>
                  <Button
                    variant="primary"
                    onClick={startGame}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-7 py-3 text-sm rounded-xl shadow-lg shadow-emerald-500/25 mt-1"
                  >
                    <Play size={16} className="mr-1.5 fill-current" /> Start Game
                  </Button>
                </div>
              )}

              {/* Game Over Overlay */}
              {gameState === 'gameover' && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                    <Flame size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-white">Energy Depleted!</h3>
                  <p className="text-xs text-slate-400">Hazardous contamination breached your collection container.</p>

                  <div className="grid grid-cols-2 gap-4 my-2 w-full max-w-xs text-left bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">FINAL SCORE</span>
                      <span className="text-xl font-bold text-emerald-400">{gameScore}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">ITEMS RECOVERED</span>
                      <span className="text-xl font-bold text-white">{itemsCaught}</span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-400 font-medium">
                    + {Math.round(gameScore / 2)} Eco-Points credited to your platform wallet!
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <Button
                      variant="primary"
                      onClick={startGame}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl"
                    >
                      <RotateCcw size={15} className="mr-1.5" /> Play Again
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile / Screen Touch Arrow Controls */}
            <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onMouseDown={() => (isMovingLeftRef.current = true)}
                  onMouseUp={() => (isMovingLeftRef.current = false)}
                  onTouchStart={() => (isMovingLeftRef.current = true)}
                  onTouchEnd={() => (isMovingLeftRef.current = false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-slate-200 active:text-white font-bold text-sm flex items-center gap-1.5 transition-colors touch-none"
                >
                  <ArrowLeft size={16} /> Left
                </button>
                <button
                  type="button"
                  onMouseDown={() => (isMovingRightRef.current = true)}
                  onMouseUp={() => (isMovingRightRef.current = false)}
                  onTouchStart={() => (isMovingRightRef.current = true)}
                  onTouchEnd={() => (isMovingRightRef.current = false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-slate-200 active:text-white font-bold text-sm flex items-center gap-1.5 transition-colors touch-none"
                >
                  Right <ArrowRight size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Trophy size={14} className="text-amber-400" />
                <span>High Score: {highScore}</span>
              </div>
            </div>
          </div>

          {/* Component Salvage Legend */}
          <div className="card p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" /> Sorted Materials:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                PCB (+30)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold">
                Copper (+25)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-semibold">
                Battery (+40)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                Gold IC (+100)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                Toxic Acid (-1 Life)
              </span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Eco-Badges & Community Leaderboard */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Achievement Badges Showcase */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award size={18} className="text-amber-500" /> Circular Badges
              </h3>
              <span className="text-xs text-slate-400">3 of 4 Unlocked</span>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Silicon Rescuer', desc: 'Diverted 50+ printed circuit boards from landfills', unlocked: true, icon: '🏆' },
                { title: 'Precious Metal Hunter', desc: 'Recovered over 5 grams of high-purity gold (Au)', unlocked: true, icon: '🥇' },
                { title: 'Battery Guardian', desc: 'Zero safety leaks on lithium pack recycling', unlocked: true, icon: '⚡' },
                { title: 'Zero-Waste Champion', desc: 'Reach a 10x multiplier combo streak in arcade', unlocked: false, icon: '🔒' },
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                    badge.unlocked
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{badge.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{badge.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Leaderboard */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" /> Leaderboard
              </h3>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">National Ranking</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {LEADERBOARD_DATA.map((entry) => (
                <div
                  key={entry.rank}
                  className={`py-2.5 flex items-center justify-between gap-2 ${
                    entry.isCurrentUser ? 'bg-emerald-50/60 dark:bg-emerald-950/30 px-2 rounded-lg font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        entry.rank === 1
                          ? 'bg-amber-400 text-amber-950'
                          : entry.rank === 2
                          ? 'bg-slate-300 text-slate-900'
                          : entry.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {entry.name} {entry.isCurrentUser && '(You)'}
                      </p>
                      <p className="text-[10px] text-slate-400">{entry.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{entry.points.toLocaleString()} pts</p>
                    <p className="text-[10px] text-slate-400">{entry.divertedKg} kg saved</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Eco-Points Redemption Rewards Store */}
      <section className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Gift size={20} className="text-emerald-600" /> Eco-Points Rewards Store
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exchange your hard-earned arcade points and recycling credits for tangible green impact.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Available: <span className="text-emerald-600 font-bold">{ecoPoints.toLocaleString()} pts</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="card p-5 flex flex-col justify-between gap-4 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  {reward.icon === 'tree' && <TreePine size={24} />}
                  {reward.icon === 'truck' && <Truck size={24} />}
                  {reward.icon === 'award' && <Award size={24} />}
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{reward.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {reward.description}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {reward.costPoints} pts
                </span>
                <Button
                  variant={reward.claimed ? 'outline' : 'primary'}
                  size="sm"
                  disabled={reward.claimed || ecoPoints < reward.costPoints}
                  onClick={() => handleClaimReward(reward)}
                  className={`text-xs font-semibold ${
                    reward.claimed ? 'border-emerald-500 text-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {reward.claimed ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={13} /> Claimed
                    </span>
                  ) : (
                    'Redeem Reward'
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Claimed Voucher Modal */}
      {claimedVoucher && (
        <Modal
          isOpen={Boolean(claimedVoucher)}
          onClose={() => setClaimedVoucher(null)}
          title="Reward Claimed Successfully!"
          size="md"
        >
          <div className="flex flex-col items-center text-center p-4 gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{claimedVoucher.title}</h4>
              <p className="text-xs text-slate-500 mt-1">
                Your reward has been processed. Present this voucher code at checkout or keep it for tree geo-tracking.
              </p>
            </div>
            <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-base font-bold text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-slate-700 select-all">
              {claimedVoucher.code}
            </div>
            <Button
              variant="primary"
              onClick={() => setClaimedVoucher(null)}
              className="bg-emerald-600 text-white w-full text-xs font-semibold"
            >
              Done
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GamificationPage;
