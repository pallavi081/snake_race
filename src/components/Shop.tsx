import React, { useState } from 'react';
import { X, Lock, Check, ShoppingBag, Sparkles, CreditCard } from 'lucide-react';
import { storage } from '../utils/storage';
import { SKINS, THEMES, HATS, TRAILS, Skin, Theme, Hat, Trail } from '../data/skins';

interface ShopProps {
    onClose: () => void;
    onPurchase?: () => void;
}

type ShopItem = Skin | Theme | Hat | Trail;
type Category = 'skins' | 'themes' | 'hats' | 'trails';

const Shop: React.FC<ShopProps> = ({ onClose, onPurchase }) => {
    const [tab, setTab] = useState<Category>('skins');
    const [player, setPlayer] = useState(storage.getPlayer());
    const [showPayment, setShowPayment] = useState<{ type: Category; item: ShopItem } | null>(null);
    const [showUPI, setShowUPI] = useState(false);

    const refreshPlayer = () => setPlayer(storage.getPlayer());

    const isUnlocked = (id: string, type: Category) => {
        if (type === 'skins') return player.unlockedSkins.includes(id);
        if (type === 'themes') return player.unlockedThemes.includes(id);
        if (type === 'hats') return player.unlockedHats.includes(id);
        if (type === 'trails') return true; // Trails are free for now or unlock with skins
        return true;
    };

    const isSelected = (id: string, type: Category) => {
        if (type === 'skins') return player.selectedSkin === id;
        if (type === 'themes') return player.selectedTheme === id;
        if (type === 'hats') return player.selectedHat === id;
        if (type === 'trails') return player.selectedTrail === id;
        return false;
    };

    const handleBuy = (item: ShopItem, type: Category) => {
        if (item.isPremium) {
            setShowPayment({ type, item });
            return;
        }

        if (player.coins < item.price) {
            alert('Not enough coins!');
            return;
        }

        const newCoins = player.coins - item.price;
        const saveObj: any = { coins: newCoins };

        if (type === 'skins') saveObj.unlockedSkins = [...player.unlockedSkins, item.id];
        else if (type === 'themes') saveObj.unlockedThemes = [...player.unlockedThemes, item.id];
        else if (type === 'hats') saveObj.unlockedHats = [...player.unlockedHats, item.id];

        storage.savePlayer(saveObj);
        refreshPlayer();
        onPurchase?.();
    };

    const handleSelect = (id: string, type: Category) => {
        const saveObj: any = {};
        if (type === 'skins') saveObj.selectedSkin = id;
        else if (type === 'themes') saveObj.selectedTheme = id;
        else if (type === 'hats') saveObj.selectedHat = id;
        else if (type === 'trails') saveObj.selectedTrail = id;

        storage.savePlayer(saveObj);
        refreshPlayer();
    };

    const handleUPIPayment = () => {
        if (!showPayment) return;
        const amount = showPayment.item.premiumPrice;
        const upiLink = `upi://pay?pa=9931322271@ptyes&pn=SnakeRace&am=${amount}&cu=INR&tn=Premium_${showPayment.item.id}`;
        window.location.href = upiLink;

        setTimeout(() => {
            const confirmed = confirm('Did you complete the payment? Click OK to unlock.');
            if (confirmed) {
                const type = showPayment.type;
                const saveObj: any = {};
                if (type === 'skins') saveObj.unlockedSkins = [...player.unlockedSkins, showPayment.item.id];
                else if (type === 'themes') saveObj.unlockedThemes = [...player.unlockedThemes, showPayment.item.id];
                else if (type === 'hats') saveObj.unlockedHats = [...player.unlockedHats, showPayment.item.id];

                storage.savePlayer(saveObj);
                refreshPlayer();
                setShowPayment(null);
                setShowUPI(false);
            }
        }, 3000);
    };

    const renderItem = (item: ShopItem, type: Category) => {
        const unlocked = isUnlocked(item.id, type);
        const selected = isSelected(item.id, type);
        let color = '#333';
        let preview: React.ReactNode = '🐍';

        if ('color' in item) color = item.color;
        if ('bgColor' in item) color = item.bgColor;

        if (type === 'themes') preview = '🗺️';
        if (type === 'hats') preview = (item as Hat).icon || '❓';
        if (type === 'trails') preview = '✨';

        return (
            <div
                key={item.id}
                className={`relative p-3 rounded-lg border-2 transition-all ${selected ? 'border-green-500 bg-green-500/10' : unlocked ? 'border-gray-600 bg-gray-700/50' : 'border-gray-700 bg-gray-800/50'
                    }`}
            >
                <div
                    className="w-full h-16 rounded-lg mb-2 flex items-center justify-center text-3xl"
                    style={{ background: 'gradient' in item && item.gradient ? `linear-gradient(90deg, ${item.gradient.join(', ')})` : color }}
                >
                    {preview}
                </div>

                <div className="text-sm font-bold truncate">{item.name}</div>
                <div className="flex items-center justify-between mt-1">
                    {unlocked ? (
                        selected ? (
                            <span className="text-xs text-green-400 flex items-center gap-1"><Check size={12} /> Equipped</span>
                        ) : (
                            <button
                                onClick={() => handleSelect(item.id, type)}
                                className="text-xs text-blue-400 hover:text-blue-300 font-bold"
                            >
                                Select
                            </button>
                        )
                    ) : item.isPremium ? (
                        <span className="text-xs text-purple-400 flex items-center gap-1 font-bold">
                            <Sparkles size={12} /> ₹{item.premiumPrice}
                        </span>
                    ) : (
                        <span className="text-xs text-yellow-400 font-bold">🪙 {item.price}</span>
                    )}

                    {!unlocked && (
                        <button
                            onClick={() => handleBuy(item, type)}
                            className={`text-xs px-2 py-1 rounded font-bold ${item.isPremium ? 'bg-purple-600 hover:bg-purple-500' : 'bg-yellow-600 hover:bg-yellow-500'
                                }`}
                        >
                            Buy
                        </button>
                    )}
                </div>

                {!unlocked && (
                    <div className="absolute top-2 right-2">
                        <Lock size={14} className="text-gray-500" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-700 shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
                    <h2 className="text-2xl font-black flex items-center gap-2 italic uppercase tracking-wider">
                        <ShoppingBag className="text-purple-400" /> Shop
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="bg-gray-900 px-4 py-1.5 rounded-full border border-yellow-500/30 flex items-center gap-2">
                            <span className="text-yellow-400 font-black">🪙 {player.coins}</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-2 border-b border-gray-700 flex gap-2 bg-gray-900/50 overflow-x-auto">
                    {[
                        { id: 'skins', label: 'Skins', icon: '🐍' },
                        { id: 'hats', label: 'Hats', icon: '👑' },
                        { id: 'trails', label: 'Trails', icon: '✨' },
                        { id: 'themes', label: 'Themes', icon: '🗺️' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id as Category)}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-black whitespace-nowrap transition-all flex items-center justify-center gap-2 ${tab === t.id ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
                        >
                            <span>{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-900/20">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {tab === 'skins' && SKINS.map(s => renderItem(s, 'skins'))}
                        {tab === 'themes' && THEMES.map(t => renderItem(t, 'themes'))}
                        {tab === 'hats' && HATS.map(h => renderItem(h, 'hats'))}
                        {tab === 'trails' && TRAILS.map(tr => renderItem(tr, 'trails'))}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex items-center justify-center gap-3">
                    <Sparkles size={18} className="text-purple-400 animate-pulse" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Premium items unlock exclusive effects & styles</p>
                </div>
            </div>

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
