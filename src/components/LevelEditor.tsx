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
    const containerRef = useRef<HTMLDivElement>(null);

    // Grid config
    const COLS = 40; // 800px / 20
    const ROWS = 30; // 600px / 20
    const CANVAS_WIDTH = COLS * GRID_SIZE;
    const CANVAS_HEIGHT = ROWS * GRID_SIZE;

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

    const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0]?.clientX || e.changedTouches[0]?.clientX;
            clientY = e.touches[0]?.clientY || e.changedTouches[0]?.clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = Math.floor((clientX - rect.left) * scaleX / GRID_SIZE);
        const y = Math.floor((clientY - rect.top) * scaleY / GRID_SIZE);

        if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return null;
        return { x, y };
    };

    const handleInteraction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const coords = getCanvasCoords(e);
        if (!coords) return;

        const { x, y } = coords;

        if (mode === 'draw') {
            if (!walls.some(w => w.x === x && w.y === y)) {
                setWalls(prev => [...prev, { x, y }]);
            }
        } else {
            setWalls(prev => prev.filter(w => w.x !== x || w.y !== y));
        }
    };

    const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        setIsDrawing(true);
        handleInteraction(e);
    };

    const handleEnd = () => {
        setIsDrawing(false);
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
        <div className="flex flex-col min-h-screen bg-gray-900 overflow-hidden">
            {/* Header */}
            <div className="p-3 flex justify-between items-center flex-shrink-0 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        <Grid className="text-blue-500" size={20} /> Level Editor
                    </h1>
                </div>

                <div className="flex gap-1">
                    <button
                        onClick={() => setMode('draw')}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 text-sm transition-colors ${mode === 'draw' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                    >
                        <div className="w-3 h-3 bg-gray-400 border border-white"></div> Draw Wall
                    </button>
                    <button
                        onClick={() => setMode('erase')}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 text-sm transition-colors ${mode === 'erase' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                    >
                        <Eraser size={14} /> Erase
                    </button>
                </div>
            </div>

            {/* Canvas Container - fills available space */}
            <div ref={containerRef} className="flex-1 flex items-center justify-center p-2 overflow-hidden bg-gray-900">
                <div className="relative border-2 border-gray-700 rounded-lg shadow-2xl overflow-hidden bg-black w-full max-w-4xl" style={{ aspectRatio: `${COLS}/${ROWS}` }}>
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        onMouseDown={handleStart}
                        onMouseUp={handleEnd}
                        onMouseLeave={handleEnd}
                        onMouseMove={handleInteraction}
                        onTouchStart={handleStart}
                        onTouchEnd={handleEnd}
                        onTouchMove={handleInteraction}
                        className="cursor-crosshair block w-full h-full"
                        style={{ touchAction: 'none' }}
                    />
                </div>
            </div>

            {/* Footer Controls */}
            <div className="p-3 flex justify-between items-center flex-shrink-0 bg-gray-800 border-t border-gray-700">
                <button onClick={clearLevel} className="px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 rounded-lg font-bold flex items-center gap-2 text-sm">
                    <Trash2 size={16} /> Clear Map
                </button>

                <div className="flex gap-2">
                    <button onClick={saveLevel} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold flex items-center gap-2 text-sm">
                        <Save size={16} /> Save Level
                    </button>
                    <button
                        onClick={() => { saveLevel(); onPlay(); }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold flex items-center gap-2 text-sm"
                    >
                        <Play size={16} /> Play Level
                    </button>
                </div>
            </div>

            <p className="text-center text-gray-500 text-xs py-2 bg-gray-800 flex-shrink-0">
                Click and drag to paint walls. Saved levels appear in Classic Mode.
            </p>
        </div>
    );
};

export default LevelEditor;

