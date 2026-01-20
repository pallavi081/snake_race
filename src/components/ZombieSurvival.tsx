import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Skull, Heart, Shield, Clock, Zap, Target, Trophy } from 'lucide-react';
import { Position, Direction } from '../types/game';
import SwipeControls from './SwipeControls';
import storage from '../utils/storage';
import { audio } from '../utils/audio';

interface ZombieSurvivalProps {
    onBack: () => void;
}

const GRID_SIZE = 20;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const COLS = CANVAS_WIDTH / GRID_SIZE;
const ROWS = CANVAS_HEIGHT / GRID_SIZE;

interface ZombieSnake {
    id: string;
    segments: Position[];
    direction: Direction;
}

interface GameState {
    playerSnake: Position[];
    playerDirection: Direction;
    zombies: ZombieSnake[];
    foods: Position[];
    cures: Position[];
    health: number;
    maxHealth: number;
    score: number;
    survivalTime: number;
    gameOver: boolean;
    gameStarted: boolean;
    wave: number;
}

const ZombieSurvival: React.FC<ZombieSurvivalProps> = ({ onBack }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
    const directionRef = useRef<Direction>('RIGHT');

    const [gameState, setGameState] = useState<GameState>({
        playerSnake: [],
        playerDirection: 'RIGHT',
        zombies: [],
        foods: [],
        cures: [],
        health: 3,
        maxHealth: 3,
        score: 0,
        survivalTime: 0,
        gameOver: false,
        gameStarted: false,
        wave: 1
    });

    const startNewGame = () => {
        // Initial player
        const playerStart: Position[] = [];
        for (let i = 0; i < 5; i++) {
            playerStart.push({ x: 10 - i, y: Math.floor(ROWS / 2) });
        }

        audio.playClick();
        setGameState({
            playerSnake: playerStart,
            playerDirection: 'RIGHT',
            zombies: [],
            foods: spawnPositions(5),
            cures: spawnPositions(1),
            health: 3,
            maxHealth: 3,
            score: 0,
            survivalTime: 0,
            gameOver: false,
            gameStarted: true,
            wave: 1
        });
        directionRef.current = 'RIGHT';
    };

    const spawnPositions = (count: number): Position[] => {
        const pos: Position[] = [];
        for (let i = 0; i < count; i++) {
            pos.push({
                x: Math.floor(Math.random() * (COLS - 2)) + 1,
                y: Math.floor(Math.random() * (ROWS - 2)) + 1
            });
        }
        return pos;
    };

    // Game Loop logic
    useEffect(() => {
        if (!gameState.gameStarted || gameState.gameOver) return;

        const moveZombies = (zombies: ZombieSnake[], playerPos: Position): ZombieSnake[] => {
            return zombies.map(z => {
                const head = { ...z.segments[0] };
                const dx = playerPos.x - head.x;
                const dy = playerPos.y - head.y;

                let newDir = z.direction;
                if (Math.abs(dx) > Math.abs(dy)) {
                    newDir = dx > 0 ? 'RIGHT' : 'LEFT';
                } else {
                    newDir = dy > 0 ? 'DOWN' : 'UP';
                }

                switch (newDir) {
                    case 'UP': head.y -= 1; break;
                    case 'DOWN': head.y += 1; break;
                    case 'LEFT': head.x -= 1; break;
                    case 'RIGHT': head.x += 1; break;
                }

                // Clip to bounds
                head.x = Math.max(0, Math.min(COLS - 1, head.x));
                head.y = Math.max(0, Math.min(ROWS - 1, head.y));

                return {
                    ...z,
                    segments: [head, ...z.segments.slice(0, -1)],
                    direction: newDir
                };
            });
        };

        const runLoop = () => {
            setGameState(prev => {
                if (prev.gameOver) return prev;

                const playerHead = { ...prev.playerSnake[0] };
                switch (directionRef.current) {
                    case 'UP': playerHead.y -= 1; break;
                    case 'DOWN': playerHead.y += 1; break;
                    case 'LEFT': playerHead.x -= 1; break;
                    case 'RIGHT': playerHead.x += 1; break;
                }

                // Wall collision
                if (playerHead.x < 0 || playerHead.x >= COLS || playerHead.y < 0 || playerHead.y >= ROWS) {
                    audio.playCrash();
                    const newHealth = prev.health - 1;
                    if (newHealth <= 0) return { ...prev, gameOver: true };
                    return { ...prev, health: newHealth, playerSnake: [{ x: 10, y: Math.floor(ROWS / 2) }] };
                }

                // Bite self
                if (prev.playerSnake.some(s => s.x === playerHead.x && s.y === playerHead.y)) {
                    audio.playCrash();
                    return { ...prev, gameOver: true };
                }

                let newPlayerSnake = [playerHead, ...prev.playerSnake];
                let ateFood = false;
                let cured = false;

                // Food
                const newFoods = prev.foods.filter(f => {
                    if (f.x === playerHead.x && f.y === playerHead.y) {
                        ateFood = true;
                        return false;
                    }
                    return true;
                });
                if (!ateFood) newPlayerSnake.pop();
                else audio.playEat();
                if (newFoods.length < 5) newFoods.push(...spawnPositions(1));

                // Cures
                const newCures = prev.cures.filter(c => {
                    if (c.x === playerHead.x && c.y === playerHead.y) {
                        cured = true;
                        return false;
                    }
                    return true;
                });
                if (cured) audio.playPowerUp();
                if (newCures.length < 1 && Math.random() < 0.05) newCures.push(...spawnPositions(1));

                // Zombies
                let newZombies = moveZombies(prev.zombies, playerHead);

                // Zombie collision
                let playerHit = false;
                newZombies.forEach(z => {
                    if (z.segments.some(seg => seg.x === playerHead.x && seg.y === playerHead.y)) {
                        playerHit = true;
                    }
                });

                // Cure wipes half of zombies
                if (cured) {
                    newZombies = newZombies.slice(0, Math.floor(newZombies.length / 2));
                }

                // Spawn new wave
                let wave = prev.wave;
                let score = prev.score + (ateFood ? 10 : 0);
                if (prev.survivalTime % 200 === 0) { // Every ~20 seconds
                    wave++;
                    audio.playLevelUp();
                    newZombies.push({
                        id: Date.now().toString(),
                        segments: [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }],
                        direction: 'RIGHT'
                    });
                }

                let health = prev.health;
                if (playerHit) {
                    audio.playExplosion();
                    health -= 1;
                    if (health <= 0) return { ...prev, health: 0, gameOver: true };
                    // Reset player to safe spot
                    newPlayerSnake = [{ x: COLS / 2, y: ROWS / 2 }];
                }

                return {
                    ...prev,
                    playerSnake: newPlayerSnake,
                    zombies: newZombies,
                    foods: newFoods,
                    cures: newCures,
                    health,
                    score,
                    survivalTime: prev.survivalTime + 1,
                    wave,
                    gameStarted: true
                };
            });
        };

        gameLoopRef.current = setInterval(runLoop, 100);
        return () => clearInterval(gameLoopRef.current!);
    }, [gameState.gameStarted, gameState.gameOver]);

    // Render
    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Grid faint
        ctx.strokeStyle = '#1a1a1a';
        for (let i = 0; i < COLS; i++) {
            ctx.beginPath(); ctx.moveTo(i * GRID_SIZE, 0); ctx.lineTo(i * GRID_SIZE, CANVAS_HEIGHT); ctx.stroke();
        }
        for (let i = 0; i < ROWS; i++) {
            ctx.beginPath(); ctx.moveTo(0, i * GRID_SIZE); ctx.lineTo(CANVAS_WIDTH, i * GRID_SIZE); ctx.stroke();
        }

        // Food
        ctx.fillStyle = '#22c55e';
        gameState.foods.forEach(f => ctx.fillRect(f.x * GRID_SIZE + 2, f.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4));

        // Cures
        ctx.fillStyle = '#3b82f6';
        gameState.cures.forEach(c => {
            ctx.fillRect(c.x * GRID_SIZE + 2, c.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
            ctx.fillStyle = '#fff';
            ctx.fillRect(c.x * GRID_SIZE + 8, c.y * GRID_SIZE + 4, 4, 12);
            ctx.fillRect(c.x * GRID_SIZE + 4, c.y * GRID_SIZE + 8, 12, 4);
        });

        // Player
        ctx.fillStyle = '#3b82f6';
        gameState.playerSnake.forEach((s, i) => {
            ctx.fillStyle = i === 0 ? '#60a5fa' : '#3b82f6';
            ctx.fillRect(s.x * GRID_SIZE + 1, s.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        });

        // Zombies
        gameState.zombies.forEach(z => {
            z.segments.forEach((s, i) => {
                ctx.fillStyle = i === 0 ? '#84cc16' : '#4d7c0f';
                ctx.fillRect(s.x * GRID_SIZE + 1, s.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
                if (i === 0) {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(s.x * GRID_SIZE + 4, s.y * GRID_SIZE + 4, 4, 4);
                    ctx.fillRect(s.x * GRID_SIZE + 12, s.y * GRID_SIZE + 4, 4, 4);
                }
            });
        });

        if (gameState.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 40px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('ZOMBIES GOT YOU!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
            ctx.font = '20px sans-serif';
            ctx.fillText(`Survival Time: ${Math.floor(gameState.survivalTime / 10)}s`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
            ctx.fillText(`Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
        }
    }, [gameState]);

    const handleSwipe = (dir: Direction) => {
        const opposite = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        if (dir !== opposite[directionRef.current]) directionRef.current = dir;
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const keys: any = { ArrowUp: 'UP', w: 'UP', ArrowDown: 'DOWN', s: 'DOWN', ArrowLeft: 'LEFT', a: 'LEFT', ArrowRight: 'RIGHT', d: 'RIGHT' };
            if (keys[e.key]) handleSwipe(keys[e.key]);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
            <div className="w-full max-w-3xl flex justify-between items-center mb-4">
                <button onClick={onBack} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                    <ArrowLeft />
                </button>
                <div className="flex gap-6 items-center">
                    <div className="flex items-center gap-2">
                        <Heart className="text-red-500 fill-red-500" />
                        <span className="text-xl font-bold">{gameState.health}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="text-blue-400" />
                        <span className="text-xl font-bold">{Math.floor(gameState.survivalTime / 10)}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Target className="text-yellow-400" />
                        <span className="text-xl font-bold">{gameState.score}</span>
                    </div>
                </div>
                <div className="text-green-500 font-black">WAVE {gameState.wave}</div>
            </div>

            {!gameState.gameStarted ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <Skull size={100} className="text-green-500 mb-6 animate-pulse" />
                    <h2 className="text-4xl font-black mb-4">ZOMBIE SURVIVAL</h2>
                    <p className="text-gray-400 max-w-md mb-8">
                        Avoid the zombie snakes! Collect green food to grow and blue cures to wipe out waves of undead.
                    </p>
                    <button onClick={startNewGame} className="px-12 py-4 bg-green-600 hover:bg-green-500 rounded-full text-2xl font-black transition-all transform hover:scale-110">
                        START SURVIVAL
                    </button>
                </div>
            ) : (
                <SwipeControls onSwipe={handleSwipe}>
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        className="border-4 border-gray-800 rounded-2xl shadow-[0_0_50px_rgba(34,197,94,0.2)]"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                </SwipeControls>
            )}

            {gameState.gameOver && (
                <button onClick={startNewGame} className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold">
                    RETRY SURVIVAL
                </button>
            )}
        </div>
    );
};

export default ZombieSurvival;
