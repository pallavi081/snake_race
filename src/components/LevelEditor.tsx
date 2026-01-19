import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Trash2, Play, Eraser, Grid } from 'lucide-react';
import { Position } from '../types/game';
import { GRID_SIZE } from '../utils/gameLogic';

interface LevelEditorProps {
    onBack: () => void;
    onPlay: () => void;
}

const LevelEditor: React.FC<LevelEditorProps> = ({ onBack, onPlay }) => {
    const [walls, setWalls] = useState<Position[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [mode, setMode] = useState<'draw' | 'erase'>('draw');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Grid config
    const COLS = 40; // 800px / 20
    const ROWS = 30; // 600px / 20

    useEffect(() => {
        // Load existing level
        const saved = localStorage.getItem('snake-custom-level-classic');
        if (saved) {
            try {
                setWalls(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load level", e);
            }
        }
    }, []);

    useEffect(() => {
        drawCanvas();
    }, [walls]);

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        // Walls
        ctx.fillStyle = '#6b7280'; // Gray walls
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        walls.forEach(w => {
            ctx.fillRect(w.x * GRID_SIZE + 1, w.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        });
        ctx.shadowBlur = 0;
    };

    const handeInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / GRID_SIZE);
        const y = Math.floor((e.clientY - rect.top) / GRID_SIZE);

        if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;

        if (mode === 'draw') {
            // Add wall if not exists
            if (!walls.some(w => w.x === x && w.y === y)) {
                setWalls(prev => [...prev, { x, y }]);
            }
        } else {
            // Remove wall
            setWalls(prev => prev.filter(w => w.x !== x || w.y !== y));
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        handeInteraction(e); // Click to place immediately
    };

    const saveLevel = () => {
        localStorage.setItem('snake-custom-level-classic', JSON.stringify(walls));
        alert('Level Saved!');
    };

    const clearLevel = () => {
        if (confirm('Clear all walls?')) {
            setWalls([]);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
            <div className="w-full max-w-4xl mb-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-white">
                        <ArrowLeft />
                    </button>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Grid className="text-blue-500" /> Level Editor
                    </h1>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('draw')}
                        className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${mode === 'draw' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >
                        <div className="w-4 h-4 bg-gray-400 border border-white"></div> Draw Wall
                    </button>
                    <button
                        onClick={() => setMode('erase')}
                        className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${mode === 'erase' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >
                        <Eraser size={18} /> Erase
                    </button>
                </div>
            </div>

            <div className="relative border-4 border-gray-700 rounded-lg shadow-2xl overflow-hidden bg-black">
                <canvas
                    ref={canvasRef}
                    width={COLS * GRID_SIZE}
                    height={ROWS * GRID_SIZE}
                    onMouseDown={handleMouseDown}
                    onMouseUp={() => setIsDrawing(false)}
                    onMouseLeave={() => setIsDrawing(false)}
                    onMouseMove={handeInteraction}
                    className="cursor-crosshair block"
                />
            </div>

            <div className="w-full max-w-4xl mt-6 flex justify-between">
                <button onClick={clearLevel} className="px-6 py-3 bg-red-900/50 hover:bg-red-900 text-red-200 rounded-lg font-bold flex items-center gap-2">
                    <Trash2 size={20} /> Clear Map
                </button>

                <div className="flex gap-4">
                    <button onClick={saveLevel} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold flex items-center gap-2">
                        <Save size={20} /> Save Level
                    </button>
                    <button
                        onClick={() => { saveLevel(); onPlay(); }}
                        className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                    >
                        <Play size={20} /> Play Level
                    </button>
                </div>
            </div>

            <p className="mt-4 text-gray-500 text-sm">
                Click and drag to paint walls. Saved levels appear in Classic Mode.
            </p>
        </div>
    );
};

export default LevelEditor;
