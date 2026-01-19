import React, { useState, useEffect } from 'react';
import { X, Lock, Check, ShoppingBag, Sparkles, CreditCard } from 'lucide-react';
import { storage } from '../utils/storage';
import { SKINS, THEMES, Skin, Theme } from '../data/skins';

interface ShopProps {
    onClose: () => void;
    onPurchase?: () => void;
}

const Shop: React.FC<ShopProps> = ({ onClose, onPurchase }) => {
    const [tab, setTab] = useState<'skins' | 'themes'>('skins');
    const [player, setPlayer] = useState(storage.getPlayer());
    const [showPayment, setShowPayment] = useState<{ type: 'skin' | 'theme'; item: Skin | Theme } | null>(null);
    const [showUPI, setShowUPI] = useState(false);

    const refreshPlayer = () => setPlayer(storage.getPlayer());

    const isUnlocked = (id: string, type: 'skin' | 'theme') => {
        return type === 'skin' ? player.unlockedSkins.includes(id) : player.unlockedThemes.includes(id);
    };

    const isSelected = (id: string, type: 'skin' | 'theme') => {
        return type === 'skin' ? player.selectedSkin === id : player.selectedTheme === id;
    };

    const handleBuy = (item: Skin | Theme, type: 'skin' | 'theme') => {
        if (item.isPremium) {
            setShowPayment({ type, item });
            return;
        }

        if (player.coins < item.price) {
            alert('Not enough coins!');
            return;
        }

        const newCoins = player.coins - item.price;
        const newUnlocked = type === 'skin'
            ? [...player.unlockedSkins, item.id]
            : [...player.unlockedThemes, item.id];

        storage.savePlayer({
            coins: newCoins,
            ...(type === 'skin' ? { unlockedSkins: newUnlocked } : { unlockedThemes: newUnlocked }),
        });
        refreshPlayer();
        onPurchase?.();
    };

    const handleSelect = (id: string, type: 'skin' | 'theme') => {
        storage.savePlayer(type === 'skin' ? { selectedSkin: id } : { selectedTheme: id });
        refreshPlayer();
    };

    const handleUPIPayment = () => {
        if (!showPayment) return;
        const amount = showPayment.item.premiumPrice;
        const upiLink = `upi://pay?pa=9931322271@ptyes&pn=SnakeRace&am=${amount}&cu=INR&tn=Premium_${showPayment.item.id}`;
        window.location.href = upiLink;
        // Show manual verification after
        setTimeout(() => {
            const confirmed = confirm('Did you complete the payment? Click OK to unlock.');
            if (confirmed) {
                const type = showPayment.type;
                const newUnlocked = type === 'skin'
                    ? [...player.unlockedSkins, showPayment.item.id]
                    : [...player.unlockedThemes, showPayment.item.id];
                storage.savePlayer(type === 'skin' ? { unlockedSkins: newUnlocked } : { unlockedThemes: newUnlocked });
                refreshPlayer();
                setShowPayment(null);
                setShowUPI(false);
            }
        }, 3000);
    };

    const renderItem = (item: Skin | Theme, type: 'skin' | 'theme') => {
        const unlocked = isUnlocked(item.id, type);
        const selected = isSelected(item.id, type);
        const color = 'color' in item ? item.color : item.bgColor;

        return (
            <div
                key={item.id}
                className={`relative p-3 rounded-lg border-2 transition-all ${selected ? 'border-green-500 bg-green-500/10' : unlocked ? 'border-gray-600 bg-gray-700/50' : 'border-gray-700 bg-gray-800/50'
                    }`}
            >
                {/* Preview */}
                <div
                    className="w-full h-16 rounded-lg mb-2 flex items-center justify-center"
                    style={{ background: 'gradient' in item && item.gradient ? `linear-gradient(90deg, ${item.gradient.join(', ')})` : color }}
                >
                    {type === 'skin' ? '🐍' : '🗺️'}
                </div>

                {/* Name & Price */}
                <div className="text-sm font-medium truncate">{item.name}</div>
                <div className="flex items-center justify-between mt-1">
                    {unlocked ? (
                        selected ? (
                            <span className="text-xs text-green-400 flex items-center gap-1"><Check size={12} /> Equipped</span>
                        ) : (
                            <button
                                onClick={() => handleSelect(item.id, type)}
                                className="text-xs text-blue-400 hover:text-blue-300"
                            >
                                Select
                            </button>
                        )
                    ) : item.isPremium ? (
                        <span className="text-xs text-purple-400 flex items-center gap-1">
                            <Sparkles size={12} /> ₹{item.premiumPrice}
                        </span>
                    ) : (
                        <span className="text-xs text-yellow-400">🪙 {item.price}</span>
                    )}

                    {!unlocked && (
                        <button
                            onClick={() => handleBuy(item, type)}
                            className={`text-xs px-2 py-1 rounded ${item.isPremium ? 'bg-purple-600 hover:bg-purple-500' : 'bg-yellow-600 hover:bg-yellow-500'
                                }`}
                        >
                            {item.isPremium ? 'Buy' : 'Buy'}
                        </button>
                    )}
                </div>

                {/* Lock Icon */}
                {!unlocked && (
                    <div className="absolute top-2 right-2">
                        <Lock size={14} className="text-gray-500" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col border border-gray-700">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingBag className="text-purple-400" /> Shop
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-yellow-400 font-bold">🪙 {player.coins}</span>
                        <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="p-2 border-b border-gray-700 flex gap-2">
                    <button
                        onClick={() => setTab('skins')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium ${tab === 'skins' ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                        🐍 Skins
                    </button>
                    <button
                        onClick={() => setTab('themes')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium ${tab === 'themes' ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                        🗺️ Themes
                    </button>
                </div>

                {/* Items Grid */}
                <div className="flex-1 overflow-y-auto p-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {tab === 'skins'
                            ? SKINS.map(s => renderItem(s, 'skin'))
                            : THEMES.map(t => renderItem(t, 'theme'))}
                    </div>
                </div>

                {/* Premium Info */}
                <div className="p-3 border-t border-gray-700 text-center text-xs text-gray-400">
                    <Sparkles size={14} className="inline text-purple-400" /> Premium items unlock exclusive designs
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm border border-purple-500">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <CreditCard className="text-purple-400" /> Premium Purchase
                        </h3>
                        <div className="text-center mb-4">
                            <div className="text-2xl mb-2">{showPayment.item.name}</div>
                            <div className="text-3xl font-bold text-purple-400">₹{showPayment.item.premiumPrice}</div>
                        </div>

                        {!showUPI ? (
                            <button
                                onClick={() => setShowUPI(true)}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold mb-3"
                            >
                                Pay Now
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-gray-700 p-3 rounded-lg text-center">
                                    <div className="text-xs text-gray-400 mb-1">UPI ID</div>
                                    <div className="font-mono text-green-400">9931322271@ptyes</div>
                                </div>
                                <button
                                    onClick={handleUPIPayment}
                                    className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold"
                                >
                                    Open UPI App
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => { setShowPayment(null); setShowUPI(false); }}
                            className="w-full py-2 mt-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop;
