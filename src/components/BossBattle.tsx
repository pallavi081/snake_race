import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Heart, Zap, Shield, Clock, Trophy, Skull, Play, Lock } from 'lucide-react';
import { Position, Direction } from '../types/game';
import { BOSSES, Boss, BOSS_POWER_UPS } from '../data/bosses';
import SwipeControls from './SwipeControls';
import storage from '../utils/storage';
import { audio } from '../utils/audio';

interface BossBattleProps {
    onBack: () => void;
}

const GRID_SIZE = 20;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const COLS = CANVAS_WIDTH / GRID_SIZE;
const ROWS = CANVAS_HEIGHT / GRID_SIZE;

interface PowerUp {
    id: string;
    type: string;
    position: Position;
    emoji: string;
}

interface GameState {
    playerSnake: Position[];
    playerDirection: Direction;
    playerHealth: number;
    playerMaxHealth: number;
    playerShield: boolean;
    playerSpeedBoost: boolean;
    bossSnake: Position[];
    bossDirection: Direction;
    bossHealth: number;
    bossMaxHealth: number;
    foods: Position[];
    powerUps: PowerUp[];
    hazards: Position[];
    score: number;
    gameStarted: boolean;
    gameOver: boolean;
    victory: boolean;
    bossAbilityCooldowns: Record<string, number>;
    gameTime: number;
}

const BossBattle: React.FC<BossBattleProps> = ({ onBack }) => {
    const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
    const [mode, setMode] = useState<'select' | 'game' | 'result'>('select');
    const [unlockedBosses, setUnlockedBosses] = useState<string[]>(['viper_king']);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
    const directionRef = useRef<Direction>('RIGHT');

    const [gameState, setGameState] = useState<GameState>({
        playerSnake: [],
        playerDirection: 'RIGHT',
        playerHealth: 3,
        playerMaxHealth: 3,
        playerShield: false,
        playerSpeedBoost: false,
        bossSnake: [],
        bossDirection: 'LEFT',
        bossHealth: 100,
        bossMaxHealth: 100,
        foods: [],
        powerUps: [],
        hazards: [],
        score: 0,
        gameStarted: false,
        gameOver: false,
        victory: false,
        bossAbilityCooldowns: {},
        gameTime: 0
    });

    // Load unlocked bosses from storage
    useEffect(() => {
        const player = storage.getPlayer();
        if (player.unlockedBosses) {
            setUnlockedBosses(player.unlockedBosses);
        }
    }, []);

    // Initialize game when boss is selected
    const startBattle = (boss: Boss) => {
        setSelectedBoss(boss);

        // Initialize player snake
        const playerStart: Position[] = [];
        for (let i = 0; i < 5; i++) {
            playerStart.push({ x: 5 - i, y: Math.floor(ROWS / 2) });
        }

        // Initialize boss snake (longer based on difficulty)
        const bossLength = 8 + BOSSES.indexOf(boss) * 2;
        const bossStart: Position[] = [];
        for (let i = 0; i < bossLength; i++) {
            bossStart.push({ x: COLS - 5 + i, y: Math.floor(ROWS / 2) });
        }

        // Initialize foods
        const foods: Position[] = [];
        for (let i = 0; i < 5; i++) {
            foods.push({
                x: Math.floor(Math.random() * (COLS - 4)) + 2,
                y: Math.floor(Math.random() * (ROWS - 4)) + 2
            });
        }

        // Initialize ability cooldowns
        const cooldowns: Record<string, number> = {};
        boss.abilities.forEach(ability => {
            cooldowns[ability.id] = ability.cooldown * 2; // Start with some delay
        });

        setGameState({
            playerSnake: playerStart,
            playerDirection: 'RIGHT',
            playerHealth: 3,
            playerMaxHealth: 3,
            playerShield: false,
            playerSpeedBoost: false,
            bossSnake: bossStart,
            bossDirection: 'LEFT',
            bossHealth: boss.health,
            bossMaxHealth: boss.health,
            foods,
            powerUps: [],
            hazards: [],
            score: 0,
            gameStarted: true,
            gameOver: false,
            victory: false,
            bossAbilityCooldowns: cooldowns,
            gameTime: 0
        });

        setMode('game');
        directionRef.current = 'RIGHT';
        audio.playClick();
    };

    // Game loop
    useEffect(() => {
        if (!gameState.gameStarted || gameState.gameOver || !selectedBoss) return;

        const runGameLoop = () => {
            setGameState(prev => {
                if (prev.gameOver) return prev;

                // Move player
                const playerHead = { ...prev.playerSnake[0] };
                switch (directionRef.current) {
                    case 'UP': playerHead.y -= 1; break;
                    case 'DOWN': playerHead.y += 1; break;
                    case 'LEFT': playerHead.x -= 1; break;
                    case 'RIGHT': playerHead.x += 1; break;
                }

                // Wall collision for player
                if (playerHead.x < 0 || playerHead.x >= COLS || playerHead.y < 0 || playerHead.y >= ROWS) {
                    if (prev.playerShield) {
                        // Shield absorbs hit
                        audio.playCrash();
                        return { ...prev, playerShield: false };
                    }
                    audio.playExplosion();
                    const newHealth = prev.playerHealth - 1;
                    if (newHealth <= 0) {
                        return { ...prev, gameOver: true, victory: false };
                    }
                    // Reset player position
                    return {
                        ...prev,
                        playerHealth: newHealth,
                        playerSnake: [{ x: 5, y: Math.floor(ROWS / 2) }]
                    };
                }

                const newPlayerSnake = [playerHead, ...prev.playerSnake];
                let ateFood = false;

                // Food collision
                const newFoods = prev.foods.filter(f => {
                    if (f.x === playerHead.x && f.y === playerHead.y) {
                        ateFood = true;
                        return false;
                    }
                    return true;
                });

                if (!ateFood) {
                    newPlayerSnake.pop();
                } else {
                    audio.playEat();
                }

                // Respawn food
                while (newFoods.length < 5) {
                    newFoods.push({
                        x: Math.floor(Math.random() * (COLS - 4)) + 2,
                        y: Math.floor(Math.random() * (ROWS - 4)) + 2
                    });
                }

                // Boss AI - move towards player
                const bossHead = { ...prev.bossSnake[0] };
                const dx = playerHead.x - bossHead.x;
                const dy = playerHead.y - bossHead.y;

                let newBossDir = prev.bossDirection;
                if (Math.random() < 0.3) { // 30% chance to change direction
                    if (Math.abs(dx) > Math.abs(dy)) {
                        newBossDir = dx > 0 ? 'RIGHT' : 'LEFT';
                    } else {
                        newBossDir = dy > 0 ? 'DOWN' : 'UP';
                    }
                }

                switch (newBossDir) {
                    case 'UP': bossHead.y -= 1; break;
                    case 'DOWN': bossHead.y += 1; break;
                    case 'LEFT': bossHead.x -= 1; break;
                    case 'RIGHT': bossHead.x += 1; break;
                }

                // Keep boss in bounds
                bossHead.x = Math.max(0, Math.min(COLS - 1, bossHead.x));
                bossHead.y = Math.max(0, Math.min(ROWS - 1, bossHead.y));

                const newBossSnake = [bossHead, ...prev.bossSnake.slice(0, -1)];

                // Collision: player hits boss body = damage boss
                let bossHealth = prev.bossHealth;
                let score = prev.score;
                const hitBoss = newBossSnake.some((seg, idx) => idx > 0 && seg.x === playerHead.x && seg.y === playerHead.y);
                if (hitBoss) {
                    bossHealth -= 10;
                    score += 50;
                    audio.playEat(); // Crunch sound on boss
                }

                // Collision: boss hits player = damage player
                let playerHealth = prev.playerHealth;
                let playerShield = prev.playerShield;
                const hitByBoss = prev.playerSnake.some(seg => seg.x === bossHead.x && seg.y === bossHead.y);
                if (hitByBoss) {
                    if (playerShield) {
                        playerShield = false;
                        audio.playCrash();
                    } else {
                        playerHealth -= 1;
                        audio.playExplosion();
                    }
                }

                // Check hazards
                const inHazard = prev.hazards.some(h => h.x === playerHead.x && h.y === playerHead.y);
                if (inHazard && !playerShield) {
                    playerHealth -= 1;
                    audio.playExplosion();
                }

                // Power-up collection
                let powerUpsCopy = [...prev.powerUps];
                let speedBoost = prev.playerSpeedBoost;
                powerUpsCopy = powerUpsCopy.filter(pu => {
                    if (pu.position.x === playerHead.x && pu.position.y === playerHead.y) {
                        audio.playPowerUp();
                        switch (pu.type) {
                            case 'shield': playerShield = true; break;
                            case 'speed': speedBoost = true; break;
                            case 'double': bossHealth -= 20; score += 100; break;
                            case 'freeze': break; // Freeze boss - would need timer
                            case 'shrink': break; // Shrink player - safety
                        }
                        return false;
                    }
                    return true;
                });

                // Spawn power-ups randomly
                if (Math.random() < 0.01 && powerUpsCopy.length < 3) {
                    const puType = BOSS_POWER_UPS[Math.floor(Math.random() * BOSS_POWER_UPS.length)];
                    powerUpsCopy.push({
                        id: Date.now().toString(),
                        type: puType.id,
                        emoji: puType.emoji,
                        position: {
                            x: Math.floor(Math.random() * (COLS - 4)) + 2,
                            y: Math.floor(Math.random() * (ROWS - 4)) + 2
                        }
                    });
                }

                // Check win/lose
                let gameOver = false;
                let victory = false;
                if (bossHealth <= 0) {
                    gameOver = true;
                    victory = true;
                    score += selectedBoss.rewards.coins;
                    audio.playLevelUp();
                } else if (playerHealth <= 0) {
                    gameOver = true;
                    victory = false;
                    audio.playCrash();
                }

                return {
                    ...prev,
                    playerSnake: newPlayerSnake,
                    playerDirection: directionRef.current,
                    playerHealth,
                    playerShield,
                    playerSpeedBoost: speedBoost,
                    bossSnake: newBossSnake,
                    bossDirection: newBossDir,
                    bossHealth,
                    foods: newFoods,
                    powerUps: powerUpsCopy,
                    score,
                    gameOver,
                    victory,
                    gameTime: prev.gameTime + 1
                };
            });
        };

        const speed = gameState.playerSpeedBoost ? 80 : 120;
        gameLoopRef.current = setInterval(runGameLoop, speed);
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [gameState.gameStarted, gameState.gameOver, selectedBoss]);

    // Render game
    useEffect(() => {
        if (!canvasRef.current || !gameState.gameStarted) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Grid
        ctx.strokeStyle = '#1f2937';
        for (let x = 0; x <= COLS; x++) {
            ctx.beginPath();
            ctx.moveTo(x * GRID_SIZE, 0);
            ctx.lineTo(x * GRID_SIZE, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * GRID_SIZE);
            ctx.lineTo(CANVAS_WIDTH, y * GRID_SIZE);
            ctx.stroke();
        }

        // Hazards
        ctx.fillStyle = '#ef444450';
        gameState.hazards.forEach(h => {
            ctx.fillRect(h.x * GRID_SIZE, h.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        });

        // Food
        gameState.foods.forEach(f => {
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.arc(f.x * GRID_SIZE + GRID_SIZE / 2, f.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Power-ups
        ctx.font = '16px Arial';
        gameState.powerUps.forEach(pu => {
            ctx.fillText(pu.emoji, pu.position.x * GRID_SIZE + 2, pu.position.y * GRID_SIZE + GRID_SIZE - 2);
        });

        // Player snake
        gameState.playerSnake.forEach((seg, idx) => {
            ctx.fillStyle = idx === 0 ? '#3b82f6' : '#60a5fa';
            ctx.fillRect(seg.x * GRID_SIZE + 1, seg.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        });

        // Boss snake
        if (selectedBoss) {
            gameState.bossSnake.forEach((seg, idx) => {
                ctx.fillStyle = idx === 0 ? selectedBoss.color : selectedBoss.tailColor;
                ctx.fillRect(seg.x * GRID_SIZE + 1, seg.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
            });
        }
    }, [gameState, selectedBoss]);

    // Keyboard controls
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp': case 'w': case 'W':
                    if (directionRef.current !== 'DOWN') directionRef.current = 'UP';
                    break;
                case 'ArrowDown': case 's': case 'S':
                    if (directionRef.current !== 'UP') directionRef.current = 'DOWN';
                    break;
                case 'ArrowLeft': case 'a': case 'A':
                    if (directionRef.current !== 'RIGHT') directionRef.current = 'LEFT';
                    break;
                case 'ArrowRight': case 'd': case 'D':
                    if (directionRef.current !== 'LEFT') directionRef.current = 'RIGHT';
                    break;
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    const handleSwipe = (direction: Direction) => {
        const opposite = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        if (directionRef.current !== opposite[direction]) {
            directionRef.current = direction;
        }
    };

    const handleVictory = () => {
        if (!selectedBoss) return;

        // Award coins
        const player = storage.getPlayer();
        storage.savePlayer({ coins: player.coins + selectedBoss.rewards.coins });

        // Unlock next boss
        const bossIndex = BOSSES.findIndex(b => b.id === selectedBoss.id);
        if (bossIndex < BOSSES.length - 1) {
            const nextBoss = BOSSES[bossIndex + 1];
            if (!unlockedBosses.includes(nextBoss.id)) {
                const newUnlocked = [...unlockedBosses, nextBoss.id];
                setUnlockedBosses(newUnlocked);
                storage.savePlayer({ unlockedBosses: newUnlocked });
            }
        }

        setMode('select');
    };

    // Boss Selection Screen
    if (mode === 'select') {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <button onClick={onBack} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            🐉 Boss Battles
                        </h1>
                    </div>

                    <p className="text-gray-400 mb-6">Choose a boss to challenge. Defeat them to earn rewards and unlock the next!</p>

                    <div className="space-y-3">
                        {BOSSES.map((boss, idx) => {
                            const isUnlocked = unlockedBosses.includes(boss.id);
                            return (
                                <div
                                    key={boss.id}
                                    className={`p-4 rounded-xl border ${isUnlocked
                                        ? 'bg-gray-800 border-gray-700 hover:border-blue-500 cursor-pointer'
                                        : 'bg-gray-800/50 border-gray-700/50 opacity-60'}`}
                                    onClick={() => isUnlocked && startBattle(boss)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl">{boss.emoji}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{boss.name}</h3>
                                                {!isUnlocked && <Lock size={16} className="text-gray-500" />}
                                            </div>
                                            <p className="text-sm text-gray-400">{boss.title}</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs">
                                                <span className={`px-2 py-0.5 rounded ${boss.difficulty === 'easy' ? 'bg-green-600' :
                                                    boss.difficulty === 'medium' ? 'bg-yellow-600' :
                                                        boss.difficulty === 'hard' ? 'bg-orange-600' :
                                                            boss.difficulty === 'extreme' ? 'bg-red-600' :
                                                                'bg-purple-600'
                                                    }`}>{boss.difficulty}</span>
                                                <span className="text-red-400">❤️ {boss.health} HP</span>
                                                <span className="text-yellow-400">🪙 {boss.rewards.coins}</span>
                                            </div>
                                        </div>
                                        {isUnlocked && (
                                            <button className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold">
                                                <Play size={16} className="inline mr-1" /> Fight
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Game Screen
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
            {/* Header */}
            <div className="w-full max-w-3xl mb-3">
                <div className="flex items-center justify-between">
                    <button onClick={() => { setMode('select'); setGameState(prev => ({ ...prev, gameStarted: false, gameOver: false })); }} className="p-2 bg-gray-700 rounded-lg">
                        <ArrowLeft size={20} />
                    </button>
                    {selectedBoss && (
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{selectedBoss.emoji}</span>
                            <span className="font-bold">{selectedBoss.name}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} /> {gameState.gameTime}s
                    </div>
                </div>

                {/* Health Bars */}
                <div className="mt-3 space-y-2">
                    {/* Player Health */}
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400 text-xs w-16">YOU</span>
                        <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${(gameState.playerHealth / gameState.playerMaxHealth) * 100}%` }}
                            />
                        </div>
                        <div className="flex gap-1">
                            {Array.from({ length: gameState.playerMaxHealth }).map((_, i) => (
                                <Heart
                                    key={i}
                                    size={16}
                                    className={i < gameState.playerHealth ? 'text-red-500 fill-red-500' : 'text-gray-600'}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Boss Health */}
                    {selectedBoss && (
                        <div className="flex items-center gap-2">
                            <span className="text-red-400 text-xs w-16">BOSS</span>
                            <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 transition-all"
                                    style={{ width: `${(gameState.bossHealth / gameState.bossMaxHealth) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-gray-400">{gameState.bossHealth}/{gameState.bossMaxHealth}</span>
                        </div>
                    )}
                </div>

                {/* Power-up indicators */}
                <div className="flex gap-2 mt-2">
                    {gameState.playerShield && (
                        <div className="px-2 py-1 bg-blue-600/30 rounded flex items-center gap-1 text-xs">
                            <Shield size={12} /> Shield
                        </div>
                    )}
                    {gameState.playerSpeedBoost && (
                        <div className="px-2 py-1 bg-yellow-600/30 rounded flex items-center gap-1 text-xs">
                            <Zap size={12} /> Speed
                        </div>
                    )}
                </div>
            </div>

            {/* Game Canvas */}
            <SwipeControls onSwipe={handleSwipe}>
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="border-2 border-gray-700 rounded-lg max-w-full"
                    style={{ maxHeight: '60vh', width: 'auto' }}
                />
            </SwipeControls>

            {/* Score */}
            <div className="mt-3 text-lg font-bold">
                Score: <span className="text-yellow-400">{gameState.score}</span>
            </div>

            {/* Game Over Overlay */}
            {gameState.gameOver && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-2xl p-6 text-center max-w-sm w-full">
                        {gameState.victory ? (
                            <>
                                <Trophy size={48} className="text-yellow-400 mx-auto mb-3" />
                                <h2 className="text-2xl font-bold text-green-400 mb-2">VICTORY!</h2>
                                <p className="text-gray-400 mb-4">You defeated {selectedBoss?.name}!</p>
                            </>
                        ) : (
                            <>
                                <Skull size={48} className="text-red-400 mx-auto mb-3" />
                                <h2 className="text-2xl font-bold text-red-400 mb-2">DEFEATED</h2>
                                <p className="text-gray-400 mb-4">Better luck next time!</p>
                            </>
                        )}

                        <div className="bg-gray-700 rounded-lg p-3 mb-4">
                            <div className="text-sm text-gray-400 mb-1">Final Score</div>
                            <div className="text-2xl font-bold text-yellow-400">{gameState.score}</div>
                        </div>

                        {gameState.victory && selectedBoss && (
                            <div className="text-sm text-green-400 mb-4">
                                +{selectedBoss.rewards.coins} 🪙 +{selectedBoss.rewards.xp} XP
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => gameState.victory ? handleVictory() : startBattle(selectedBoss!)}
                                className={`px-5 py-2 rounded-lg font-bold ${gameState.victory ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                            >
                                {gameState.victory ? 'Collect Rewards' : 'Try Again'}
                            </button>
                            <button
                                onClick={() => { setMode('select'); setGameState(prev => ({ ...prev, gameStarted: false, gameOver: false })); }}
                                className="px-5 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BossBattle;
