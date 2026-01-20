import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Palette, Sparkles, Save, Share2, RotateCcw, Check } from 'lucide-react';
import storage from '../utils/storage';

interface SkinCreatorProps {
    onBack: () => void;
}

interface CustomSkin {
    id: string;
    name: string;
    headColor: string;
    bodyColor: string;
    tailColor: string;
    pattern: 'solid' | 'striped' | 'dotted' | 'gradient';
    eyeStyle: 'normal' | 'angry' | 'cute' | 'cool';
    accessory: 'none' | 'crown' | 'hat' | 'glasses' | 'bowtie';
    createdAt: string;
}

const PATTERNS = [
    { id: 'solid', name: 'Solid', icon: '⬛' },
    { id: 'striped', name: 'Striped', icon: '🟰' },
    { id: 'dotted', name: 'Dotted', icon: '⚫' },
    { id: 'gradient', name: 'Gradient', icon: '🌈' },
];

const EYE_STYLES = [
    { id: 'normal', name: 'Normal', icon: '👁️' },
    { id: 'angry', name: 'Angry', icon: '😠' },
    { id: 'cute', name: 'Cute', icon: '🥺' },
    { id: 'cool', name: 'Cool', icon: '😎' },
];

const ACCESSORIES = [
    { id: 'none', name: 'None', icon: '❌' },
    { id: 'crown', name: 'Crown', icon: '👑' },
    { id: 'hat', name: 'Top Hat', icon: '🎩' },
    { id: 'glasses', name: 'Glasses', icon: '👓' },
    { id: 'bowtie', name: 'Bow Tie', icon: '🎀' },
];

const PRESET_COLORS = [
    '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#ec4899',
    '#f97316', '#eab308', '#06b6d4', '#10b981', '#8b5cf6',
    '#f43f5e', '#84cc16', '#14b8a6', '#6366f1', '#d946ef'
];

const SkinCreator: React.FC<SkinCreatorProps> = ({ onBack }) => {
    const [skin, setSkin] = useState<CustomSkin>({
        id: Date.now().toString(),
        name: 'My Custom Skin',
        headColor: '#22c55e',
        bodyColor: '#16a34a',
        tailColor: '#15803d',
        pattern: 'solid',
        eyeStyle: 'normal',
        accessory: 'none',
        createdAt: new Date().toISOString()
    });

    const [savedSkins, setSavedSkins] = useState<CustomSkin[]>([]);
    const [showSaved, setShowSaved] = useState(false);
    const [saved, setSaved] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Load saved skins
    useEffect(() => {
        const player = storage.getPlayer();
        if (player.customSkins) {
            setSavedSkins(player.customSkins);
        }
    }, []);

    // Draw preview
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const segmentSize = 30;
        const snakeLength = 8;
        const startX = width / 2 - (snakeLength * segmentSize) / 2;
        const startY = height / 2;

        // Clear
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, width, height);

        // Draw snake preview
        for (let i = 0; i < snakeLength; i++) {
            const x = startX + i * segmentSize;
            const y = startY - Math.sin(i * 0.5) * 10;

            // Determine color based on position
            let color;
            if (i === 0) {
                color = skin.headColor;
            } else if (i === snakeLength - 1) {
                color = skin.tailColor;
            } else {
                // Pattern-based coloring
                if (skin.pattern === 'striped') {
                    color = i % 2 === 0 ? skin.bodyColor : skin.headColor;
                } else if (skin.pattern === 'dotted') {
                    color = skin.bodyColor;
                } else if (skin.pattern === 'gradient') {
                    // Interpolate between head and tail
                    const t = i / (snakeLength - 1);
                    color = lerpColor(skin.headColor, skin.tailColor, t);
                } else {
                    color = skin.bodyColor;
                }
            }

            // Draw segment
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(x, y - segmentSize / 2, segmentSize - 2, segmentSize - 2, 5);
            ctx.fill();

            // Draw dots for dotted pattern
            if (skin.pattern === 'dotted' && i > 0 && i < snakeLength - 1) {
                ctx.fillStyle = skin.headColor;
                ctx.beginPath();
                ctx.arc(x + segmentSize / 2 - 1, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw head details
            if (i === 0) {
                // Eyes
                const eyeY = y - 5;
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(x + 8, eyeY, 5, 0, Math.PI * 2);
                ctx.arc(x + 22, eyeY, 5, 0, Math.PI * 2);
                ctx.fill();

                // Pupils based on eye style
                ctx.fillStyle = '#000';
                if (skin.eyeStyle === 'normal') {
                    ctx.beginPath();
                    ctx.arc(x + 8, eyeY, 2, 0, Math.PI * 2);
                    ctx.arc(x + 22, eyeY, 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (skin.eyeStyle === 'angry') {
                    ctx.beginPath();
                    ctx.arc(x + 9, eyeY + 1, 2, 0, Math.PI * 2);
                    ctx.arc(x + 23, eyeY + 1, 2, 0, Math.PI * 2);
                    ctx.fill();
                    // Angry brows
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(x + 3, eyeY - 6);
                    ctx.lineTo(x + 13, eyeY - 3);
                    ctx.moveTo(x + 27, eyeY - 3);
                    ctx.lineTo(x + 17, eyeY - 6);
                    ctx.stroke();
                } else if (skin.eyeStyle === 'cute') {
                    // Bigger eyes
                    ctx.beginPath();
                    ctx.arc(x + 8, eyeY, 3, 0, Math.PI * 2);
                    ctx.arc(x + 22, eyeY, 3, 0, Math.PI * 2);
                    ctx.fill();
                    // Sparkles
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(x + 6, eyeY - 2, 1.5, 0, Math.PI * 2);
                    ctx.arc(x + 20, eyeY - 2, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                } else if (skin.eyeStyle === 'cool') {
                    // Sunglasses
                    ctx.fillStyle = '#1f2937';
                    ctx.fillRect(x + 2, eyeY - 5, 12, 10);
                    ctx.fillRect(x + 16, eyeY - 5, 12, 10);
                    ctx.strokeStyle = '#374151';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x + 14, eyeY);
                    ctx.lineTo(x + 16, eyeY);
                    ctx.stroke();
                }

                // Accessory
                if (skin.accessory === 'crown') {
                    ctx.fillStyle = '#fbbf24';
                    ctx.beginPath();
                    ctx.moveTo(x + 5, y - segmentSize / 2);
                    ctx.lineTo(x + 10, y - segmentSize / 2 - 10);
                    ctx.lineTo(x + 15, y - segmentSize / 2 - 5);
                    ctx.lineTo(x + 20, y - segmentSize / 2 - 10);
                    ctx.lineTo(x + 25, y - segmentSize / 2);
                    ctx.closePath();
                    ctx.fill();
                } else if (skin.accessory === 'hat') {
                    ctx.fillStyle = '#1f2937';
                    ctx.fillRect(x + 2, y - segmentSize / 2 - 5, 26, 5);
                    ctx.fillRect(x + 7, y - segmentSize / 2 - 18, 16, 15);
                } else if (skin.accessory === 'bowtie') {
                    ctx.fillStyle = '#ef4444';
                    ctx.beginPath();
                    ctx.moveTo(x + 15, y + 10);
                    ctx.lineTo(x + 5, y + 5);
                    ctx.lineTo(x + 5, y + 15);
                    ctx.closePath();
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(x + 15, y + 10);
                    ctx.lineTo(x + 25, y + 5);
                    ctx.lineTo(x + 25, y + 15);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }

        // Draw name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(skin.name, width / 2, height - 20);

    }, [skin]);

    // Color interpolation helper
    const lerpColor = (a: string, b: string, t: number): string => {
        const ah = parseInt(a.replace('#', ''), 16);
        const bh = parseInt(b.replace('#', ''), 16);
        const ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
        const br = bh >> 16, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
        const rr = Math.round(ar + (br - ar) * t);
        const rg = Math.round(ag + (bg - ag) * t);
        const rb = Math.round(ab + (bb - ab) * t);
        return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, '0')}`;
    };

    const handleSave = () => {
        const newSkin = { ...skin, id: Date.now().toString(), createdAt: new Date().toISOString() };
        const newSkins = [...savedSkins, newSkin];
        setSavedSkins(newSkins);
        storage.savePlayer({ customSkins: newSkins });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleEquip = (skinToEquip: CustomSkin) => {
        storage.savePlayer({ equippedCustomSkin: skinToEquip.id });
        setSkin(skinToEquip);
        setShowSaved(false);
    };

    const handleDelete = (skinId: string) => {
        const newSkins = savedSkins.filter(s => s.id !== skinId);
        setSavedSkins(newSkins);
        storage.savePlayer({ customSkins: newSkins });
    };

    const handleReset = () => {
        setSkin({
            id: Date.now().toString(),
            name: 'My Custom Skin',
            headColor: '#22c55e',
            bodyColor: '#16a34a',
            tailColor: '#15803d',
            pattern: 'solid',
            eyeStyle: 'normal',
            accessory: 'none',
            createdAt: new Date().toISOString()
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={onBack} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Palette className="text-purple-400" /> Skin Creator
                    </h1>
                    <div className="flex-1" />
                    <button onClick={() => setShowSaved(!showSaved)} className="px-3 py-1.5 bg-gray-700 rounded-lg text-sm">
                        My Skins ({savedSkins.length})
                    </button>
                </div>

                {showSaved ? (
                    // Saved Skins List
                    <div className="space-y-3">
                        <h2 className="text-lg font-bold mb-3">Saved Skins</h2>
                        {savedSkins.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No saved skins yet. Create one!</p>
                        ) : (
                            savedSkins.map(s => (
                                <div key={s.id} className="bg-gray-800 p-3 rounded-lg flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-lg"
                                        style={{ background: `linear-gradient(90deg, ${s.headColor}, ${s.bodyColor}, ${s.tailColor})` }}
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">{s.name}</div>
                                        <div className="text-xs text-gray-400">{s.pattern} • {s.eyeStyle}</div>
                                    </div>
                                    <button onClick={() => handleEquip(s)} className="px-3 py-1 bg-blue-600 rounded text-sm">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(s.id)} className="px-3 py-1 bg-red-600/30 rounded text-sm text-red-400">
                                        Delete
                                    </button>
                                </div>
                            ))
                        )}
                        <button onClick={() => setShowSaved(false)} className="w-full py-2 bg-gray-700 rounded-lg mt-4">
                            Back to Editor
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Preview Canvas */}
                        <div className="bg-gray-800 rounded-xl p-4 mb-4">
                            <canvas
                                ref={canvasRef}
                                width={400}
                                height={150}
                                className="w-full rounded-lg"
                            />
                        </div>

                        {/* Skin Name */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-1">Skin Name</label>
                            <input
                                type="text"
                                value={skin.name}
                                onChange={e => setSkin({ ...skin, name: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                                maxLength={20}
                            />
                        </div>

                        {/* Colors */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Head</label>
                                <div className="flex gap-1 flex-wrap">
                                    {PRESET_COLORS.slice(0, 5).map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setSkin({ ...skin, headColor: c })}
                                            className={`w-8 h-8 rounded-lg border-2 ${skin.headColor === c ? 'border-white' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                                <input
                                    type="color"
                                    value={skin.headColor}
                                    onChange={e => setSkin({ ...skin, headColor: e.target.value })}
                                    className="mt-1 w-full h-8 rounded cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Body</label>
                                <div className="flex gap-1 flex-wrap">
                                    {PRESET_COLORS.slice(5, 10).map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setSkin({ ...skin, bodyColor: c })}
                                            className={`w-8 h-8 rounded-lg border-2 ${skin.bodyColor === c ? 'border-white' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                                <input
                                    type="color"
                                    value={skin.bodyColor}
                                    onChange={e => setSkin({ ...skin, bodyColor: e.target.value })}
                                    className="mt-1 w-full h-8 rounded cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Tail</label>
                                <div className="flex gap-1 flex-wrap">
                                    {PRESET_COLORS.slice(10, 15).map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setSkin({ ...skin, tailColor: c })}
                                            className={`w-8 h-8 rounded-lg border-2 ${skin.tailColor === c ? 'border-white' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                                <input
                                    type="color"
                                    value={skin.tailColor}
                                    onChange={e => setSkin({ ...skin, tailColor: e.target.value })}
                                    className="mt-1 w-full h-8 rounded cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Pattern */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">Pattern</label>
                            <div className="flex gap-2">
                                {PATTERNS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSkin({ ...skin, pattern: p.id as any })}
                                        className={`flex-1 py-2 rounded-lg text-center ${skin.pattern === p.id ? 'bg-purple-600' : 'bg-gray-700'}`}
                                    >
                                        <span className="text-lg">{p.icon}</span>
                                        <div className="text-xs mt-1">{p.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Eye Style */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">Eye Style</label>
                            <div className="flex gap-2">
                                {EYE_STYLES.map(e => (
                                    <button
                                        key={e.id}
                                        onClick={() => setSkin({ ...skin, eyeStyle: e.id as any })}
                                        className={`flex-1 py-2 rounded-lg text-center ${skin.eyeStyle === e.id ? 'bg-blue-600' : 'bg-gray-700'}`}
                                    >
                                        <span className="text-lg">{e.icon}</span>
                                        <div className="text-xs mt-1">{e.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Accessory */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">Accessory</label>
                            <div className="flex gap-2 flex-wrap">
                                {ACCESSORIES.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => setSkin({ ...skin, accessory: a.id as any })}
                                        className={`px-3 py-2 rounded-lg ${skin.accessory === a.id ? 'bg-yellow-600' : 'bg-gray-700'}`}
                                    >
                                        <span className="text-lg">{a.icon}</span>
                                        <span className="ml-1 text-sm">{a.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button onClick={handleReset} className="flex-1 py-3 bg-gray-700 rounded-xl flex items-center justify-center gap-2">
                                <RotateCcw size={18} /> Reset
                            </button>
                            <button
                                onClick={handleSave}
                                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 ${saved ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-500'}`}
                            >
                                {saved ? <><Check size={18} /> Saved!</> : <><Save size={18} /> Save Skin</>}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SkinCreator;
