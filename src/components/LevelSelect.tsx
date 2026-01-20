import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Star, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { LevelConfig, LevelProgress, getAllLevelProgress, isLevelUnlocked, getDifficultyColor, getDifficultyBg } from '../data/levels/types';

interface LevelSelectProps {
    mode: 'classic' | 'puzzle' | 'physics';
    levels: LevelConfig[];
    onBack: () => void;
    onSelectLevel: (level: LevelConfig) => void;
}

const LevelSelect: React.FC<LevelSelectProps> = ({ mode, levels, onBack, onSelectLevel }) => {
    const [progress, setProgress] = useState<Record<number, LevelProgress>>({});
    const [expandedSection, setExpandedSection] = useState<string>('easy');

    useEffect(() => {
        setProgress(getAllLevelProgress(mode));
    }, [mode]);

    // Group levels by difficulty
    const groupedLevels = {
        easy: levels.filter(l => l.difficulty === 'easy'),
        medium: levels.filter(l => l.difficulty === 'medium'),
        hard: levels.filter(l => l.difficulty === 'hard'),
        expert: levels.filter(l => l.difficulty === 'expert'),
    };

    const sectionInfo = {
        easy: { label: 'Easy', range: '1-30', color: 'text-green-400', bg: 'bg-green-600/20', icon: '🌱' },
        medium: { label: 'Medium', range: '31-60', color: 'text-yellow-400', bg: 'bg-yellow-600/20', icon: '⚡' },
        hard: { label: 'Hard', range: '61-85', color: 'text-orange-400', bg: 'bg-orange-600/20', icon: '🔥' },
        expert: { label: 'Expert', range: '86-100', color: 'text-red-400', bg: 'bg-red-600/20', icon: '💀' },
    };

    const totalStars = Object.values(progress).reduce((sum, p) => sum + (p.stars || 0), 0);
    const totalCompleted = Object.values(progress).filter(p => p.completed).length;

    const renderStars = (count: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3].map(i => (
                    <Star
                        key={i}
                        size={12}
                        className={i <= count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                    />
                ))}
            </div>
        );
    };

    const renderLevelCard = (level: LevelConfig) => {
        const levelProgress = progress[level.id] || { completed: false, stars: 0, highScore: 0, attempts: 0 };
        const unlocked = isLevelUnlocked(mode, level.id);

        return (
            <button
                key={level.id}
                onClick={() => unlocked && onSelectLevel(level)}
                disabled={!unlocked}
                className={`relative p-3 rounded-xl border transition-all ${!unlocked
                        ? 'bg-gray-800/50 border-gray-700 opacity-60 cursor-not-allowed'
                        : levelProgress.completed
                            ? 'bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-700 hover:border-green-500'
                            : 'bg-gray-800 border-gray-700 hover:border-blue-500 hover:bg-gray-700'
                    }`}
            >
                {/* Level Number */}
                <div className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${levelProgress.completed ? 'bg-green-600' : unlocked ? 'bg-blue-600' : 'bg-gray-700'
                    }`}>
                    {level.id}
                </div>

                {/* Lock Icon */}
                {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Lock size={24} className="text-gray-500" />
                    </div>
                )}

                {unlocked && (
                    <>
                        {/* Level Name */}
                        <div className="text-sm font-medium truncate mb-1 pr-6">{level.name}</div>

                        {/* Stars or Play prompt */}
                        {levelProgress.completed ? (
                            <div className="flex items-center justify-between">
                                {renderStars(levelProgress.stars)}
                                <span className="text-xs text-gray-400">{levelProgress.highScore}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-xs text-blue-400">
                                <Play size={12} /> Play
                            </div>
                        )}

                        {/* Coin reward badge */}
                        <div className="absolute top-1 right-1 text-xs text-yellow-400">
                            +{level.coinReward}🪙
                        </div>
                    </>
                )}
            </button>
        );
    };

    const renderSection = (key: 'easy' | 'medium' | 'hard' | 'expert') => {
        const sectionLevels = groupedLevels[key];
        const info = sectionInfo[key];
        const isExpanded = expandedSection === key;
        const sectionCompleted = sectionLevels.filter(l => progress[l.id]?.completed).length;
        const sectionStars = sectionLevels.reduce((sum, l) => sum + (progress[l.id]?.stars || 0), 0);
        const maxStars = sectionLevels.length * 3;

        return (
            <div key={key} className="mb-4">
                <button
                    onClick={() => setExpandedSection(isExpanded ? '' : key)}
                    className={`w-full p-3 rounded-lg flex items-center justify-between ${info.bg} border border-gray-700 hover:border-gray-600 transition-all`}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{info.icon}</span>
                        <div className="text-left">
                            <div className={`font-bold ${info.color}`}>{info.label}</div>
                            <div className="text-xs text-gray-400">Levels {info.range}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-sm font-medium">{sectionCompleted}/{sectionLevels.length}</div>
                            <div className="flex items-center gap-1 text-xs text-yellow-400">
                                <Star size={10} className="fill-yellow-400" /> {sectionStars}/{maxStars}
                            </div>
                        </div>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </button>

                {isExpanded && (
                    <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 p-2">
                        {sectionLevels.map(renderLevelCard)}
                    </div>
                )}
            </div>
        );
    };

    const modeInfo = {
        classic: { title: 'Classic Mode', icon: '🐍', color: 'text-blue-400' },
        puzzle: { title: 'Puzzle Mode', icon: '🧩', color: 'text-green-400' },
        physics: { title: 'Physics Mode', icon: '🌀', color: 'text-yellow-400' },
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className={`text-xl font-bold flex items-center gap-2 ${modeInfo[mode].color}`}>
                                <span>{modeInfo[mode].icon}</span> {modeInfo[mode].title}
                            </h1>
                            <p className="text-xs text-gray-400">Select a level to play</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">Progress:</span>
                            <span className="font-bold text-green-400">{totalCompleted}/100</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400 text-sm">
                            <Star size={14} className="fill-yellow-400" />
                            <span>{totalStars}/300</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto p-4">
                {renderSection('easy')}
                {renderSection('medium')}
                {renderSection('hard')}
                {renderSection('expert')}
            </div>
        </div>
    );
};

export default LevelSelect;
