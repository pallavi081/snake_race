import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Gift, Clock, Star, Sparkles, Trophy } from 'lucide-react';
import storage from '../utils/storage';
import { getGlobalSettings } from '../utils/cloudStorage';

interface SeasonalEventsProps {
    onBack: () => void;
}

interface SeasonalEvent {
    id: string;
    name: string;
    emoji: string;
    description: string;
    startMonth: number; // 1-12
    startDay: number;
    endMonth: number;
    endDay: number;
    theme: string;
    colors: { primary: string; secondary: string; accent: string };
    rewards: { skin?: string; coins: number; title?: string };
    challenges: { id: string; name: string; target: number; reward: number }[];
}

const SEASONAL_EVENTS: SeasonalEvent[] = [
    {
        id: 'diwali',
        name: 'Diwali Festival',
        emoji: '🪔',
        description: 'Festival of Lights! Collect diyas and spread joy.',
        startMonth: 10, startDay: 20, endMonth: 11, endDay: 5,
        theme: 'diwali',
        colors: { primary: '#f97316', secondary: '#eab308', accent: '#ef4444' },
        rewards: { skin: 'diwali_snake', coins: 500, title: 'Diwali Champion' },
        challenges: [
            { id: 'd1', name: 'Collect 50 Diyas', target: 50, reward: 100 },
            { id: 'd2', name: 'Light 100 Lamps', target: 100, reward: 200 },
            { id: 'd3', name: 'Score 5000 Points', target: 5000, reward: 300 },
        ]
    },
    {
        id: 'christmas',
        name: 'Christmas Wonderland',
        emoji: '🎄',
        description: 'Spread holiday cheer! Collect presents and candy canes.',
        startMonth: 12, startDay: 15, endMonth: 12, endDay: 31,
        theme: 'christmas',
        colors: { primary: '#22c55e', secondary: '#ef4444', accent: '#fbbf24' },
        rewards: { skin: 'santa_snake', coins: 500, title: 'Santa Snake' },
        challenges: [
            { id: 'c1', name: 'Collect 50 Presents', target: 50, reward: 100 },
            { id: 'c2', name: 'Eat 100 Candy Canes', target: 100, reward: 200 },
            { id: 'c3', name: 'Build 25 Snowmen', target: 25, reward: 300 },
        ]
    },
    {
        id: 'valentine',
        name: "Valentine's Day",
        emoji: '❤️',
        description: 'Share the love! Collect hearts and spread romance.',
        startMonth: 2, startDay: 7, endMonth: 2, endDay: 21,
        theme: 'valentine',
        colors: { primary: '#ec4899', secondary: '#f472b6', accent: '#ef4444' },
        rewards: { skin: 'love_snake', coins: 400, title: 'Love Champion' },
        challenges: [
            { id: 'v1', name: 'Collect 100 Hearts', target: 100, reward: 100 },
            { id: 'v2', name: 'Score 3000 Points', target: 3000, reward: 200 },
            { id: 'v3', name: 'Play 10 Games', target: 10, reward: 150 },
        ]
    },
    {
        id: 'chhath',
        name: 'Chhath Puja',
        emoji: '☀️',
        description: 'Worship the Sun God! Collect offerings and blessings.',
        startMonth: 11, startDay: 5, endMonth: 11, endDay: 12,
        theme: 'chhath',
        colors: { primary: '#fbbf24', secondary: '#f97316', accent: '#0ea5e9' },
        rewards: { skin: 'sun_snake', coins: 400, title: 'Sun Worshipper' },
        challenges: [
            { id: 'ch1', name: 'Collect 50 Offerings', target: 50, reward: 100 },
            { id: 'ch2', name: 'Watch 10 Sunrises', target: 10, reward: 200 },
            { id: 'ch3', name: 'Complete River Ritual', target: 5, reward: 250 },
        ]
    },
    {
        id: 'dussehra',
        name: 'Dussehra Victory',
        emoji: '🏹',
        description: 'Victory of good over evil! Defeat Ravana and earn glory.',
        startMonth: 10, startDay: 1, endMonth: 10, endDay: 15,
        theme: 'dussehra',
        colors: { primary: '#ef4444', secondary: '#fbbf24', accent: '#22c55e' },
        rewards: { skin: 'warrior_snake', coins: 500, title: 'Ravana Slayer' },
        challenges: [
            { id: 'ds1', name: 'Score 10000 Points', target: 10000, reward: 200 },
            { id: 'ds2', name: 'Defeat 50 Enemies', target: 50, reward: 300 },
            { id: 'ds3', name: 'Burn 10 Effigies', target: 10, reward: 400 },
        ]
    },
    {
        id: 'eid',
        name: 'Eid Celebration',
        emoji: '☪️',
        description: 'Eid Mubarak! Celebrate with feasts and joy.',
        startMonth: 4, startDay: 1, endMonth: 4, endDay: 15,
        theme: 'eid',
        colors: { primary: '#22c55e', secondary: '#fbbf24', accent: '#3b82f6' },
        rewards: { skin: 'moon_snake', coins: 450, title: 'Eid Champion' },
        challenges: [
            { id: 'e1', name: 'Collect 75 Crescents', target: 75, reward: 150 },
            { id: 'e2', name: 'Share 20 Gifts', target: 20, reward: 200 },
            { id: 'e3', name: 'Score 4000 Points', target: 4000, reward: 250 },
        ]
    }
];

// Check if event is currently active
const isEventActive = (event: SeasonalEvent): boolean => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    if (event.startMonth === event.endMonth) {
        return month === event.startMonth && day >= event.startDay && day <= event.endDay;
    } else if (event.startMonth < event.endMonth) {
        return (month === event.startMonth && day >= event.startDay) ||
            (month === event.endMonth && day <= event.endDay) ||
            (month > event.startMonth && month < event.endMonth);
    } else {
        // Wraps around year (e.g., Dec to Jan)
        return (month === event.startMonth && day >= event.startDay) ||
            (month === event.endMonth && day <= event.endDay) ||
            month > event.startMonth || month < event.endMonth;
    }
};

// Get days remaining for event
const getDaysRemaining = (event: SeasonalEvent): number => {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), event.endMonth - 1, event.endDay);
    if (endDate < now) {
        endDate.setFullYear(endDate.getFullYear() + 1);
    }
    const diff = endDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const SeasonalEvents: React.FC<SeasonalEventsProps> = ({ onBack }) => {
    const [selectedEvent, setSelectedEvent] = useState<SeasonalEvent | null>(null);
    const [eventProgress, setEventProgress] = useState<Record<string, number>>({});
    const [overrides, setOverrides] = useState<Record<string, boolean>>({});
    const [globalSettings, setGlobalSettings] = useState<any>(null);

    useEffect(() => {
        const loadRemoteData = async () => {
            const settings = await getGlobalSettings();
            setGlobalSettings(settings); // Store full settings object
            if (settings.eventOverrides) {
                setOverrides(settings.eventOverrides);
            }
        };
        loadRemoteData();

        const player = storage.getPlayer();
        if (player.eventProgress) {
            setEventProgress(player.eventProgress);
        }
    }, []);

    const isEffectiveActive = (event: SeasonalEvent) => {
        // 1. Check direct override (Active/Blocked)
        const override = overrides[event.id];
        if (override === true) return true;
        if (override === false) return false;

        // 2. Check custom date range
        const customDates = globalSettings?.eventDates?.[event.id];
        if (customDates?.startDate && customDates?.endDate) {
            const now = new Date();
            const start = new Date(customDates.startDate);
            const end = new Date(customDates.endDate);
            return now >= start && now <= end;
        }

        // 3. Fallback to default logic
        return isEventActive(event);
    };

    const getRemainingDaysLocal = (event: SeasonalEvent) => {
        const customDates = globalSettings?.eventDates?.[event.id];
        if (customDates?.endDate) {
            const now = new Date();
            const end = new Date(customDates.endDate);
            const diff = end.getTime() - now.getTime();
            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
            return days > 0 ? days : 0;
        }
        return getDaysRemaining(event);
    };

    const activeEvents = SEASONAL_EVENTS.filter(isEffectiveActive);
    const upcomingEvents = SEASONAL_EVENTS.filter(e => !isEffectiveActive(e));

    const handleClaimReward = (eventId: string, challengeId: string, reward: number) => {
        const key = `${eventId}_${challengeId}_claimed`;
        if (eventProgress[key]) return; // Already claimed

        const player = storage.getPlayer();
        storage.savePlayer({ coins: player.coins + reward });

        const newProgress = { ...eventProgress, [key]: 1 };
        setEventProgress(newProgress);
        storage.savePlayer({ eventProgress: newProgress });
    };

    if (selectedEvent) {
        return (
            <div className="min-h-screen text-white p-4" style={{
                background: `linear-gradient(135deg, ${selectedEvent.colors.primary}20, ${selectedEvent.colors.secondary}20)`
            }}>
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <button onClick={() => setSelectedEvent(null)} className="p-2 bg-gray-800 rounded-lg">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="text-4xl">{selectedEvent.emoji}</div>
                        <div>
                            <h1 className="text-2xl font-bold">{selectedEvent.name}</h1>
                            <p className="text-gray-300 text-sm">{selectedEvent.description}</p>
                        </div>
                    </div>

                    {/* Time Remaining */}
                    {isEffectiveActive(selectedEvent) && (
                        <div className="bg-gray-800/80 rounded-xl p-4 mb-4 flex items-center gap-3">
                            <Clock className="text-yellow-400" />
                            <div>
                                <div className="text-sm text-gray-400">Event ends in</div>
                                <div className="text-xl font-bold text-yellow-400">{getRemainingDaysLocal(selectedEvent)} days</div>
                            </div>
                        </div>
                    )}

                    {/* Rewards */}
                    <div className="bg-gray-800/80 rounded-xl p-4 mb-4">
                        <h2 className="font-bold mb-3 flex items-center gap-2">
                            <Gift className="text-purple-400" /> Event Rewards
                        </h2>
                        <div className="flex gap-4 flex-wrap">
                            {selectedEvent.rewards.skin && (
                                <div className="bg-gray-700 rounded-lg p-3 text-center">
                                    <Sparkles className="text-purple-400 mx-auto mb-1" />
                                    <div className="text-sm font-medium">Exclusive Skin</div>
                                    <div className="text-xs text-gray-400">{selectedEvent.rewards.skin}</div>
                                </div>
                            )}
                            <div className="bg-gray-700 rounded-lg p-3 text-center">
                                <span className="text-2xl">🪙</span>
                                <div className="text-sm font-medium">{selectedEvent.rewards.coins} Coins</div>
                            </div>
                            {selectedEvent.rewards.title && (
                                <div className="bg-gray-700 rounded-lg p-3 text-center">
                                    <Trophy className="text-yellow-400 mx-auto mb-1" />
                                    <div className="text-sm font-medium">{selectedEvent.rewards.title}</div>
                                    <div className="text-xs text-gray-400">Title</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Challenges */}
                    <div className="bg-gray-800/80 rounded-xl p-4">
                        <h2 className="font-bold mb-3 flex items-center gap-2">
                            <Star className="text-yellow-400" /> Challenges
                        </h2>
                        <div className="space-y-3">
                            {selectedEvent.challenges.map(challenge => {
                                const progress = eventProgress[`${selectedEvent.id}_${challenge.id}`] || 0;
                                const claimed = eventProgress[`${selectedEvent.id}_${challenge.id}_claimed`];
                                const completed = progress >= challenge.target;

                                return (
                                    <div key={challenge.id} className="bg-gray-700 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">{challenge.name}</span>
                                            <span className="text-yellow-400 text-sm">+{challenge.reward} 🪙</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 transition-all"
                                                    style={{ width: `${Math.min(100, (progress / challenge.target) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400">{progress}/{challenge.target}</span>
                                            {completed && !claimed && (
                                                <button
                                                    onClick={() => handleClaimReward(selectedEvent.id, challenge.id, challenge.reward)}
                                                    className="px-3 py-1 bg-green-600 rounded text-xs font-bold animate-pulse"
                                                >
                                                    Claim
                                                </button>
                                            )}
                                            {claimed && (
                                                <span className="text-green-400 text-xs">✓ Claimed</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={onBack} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="text-purple-400" /> Seasonal Events
                    </h1>
                </div>

                {/* Active Events */}
                {activeEvents.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <Sparkles className="text-yellow-400" /> Active Now
                        </h2>
                        <div className="space-y-3">
                            {activeEvents.map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    className="p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                                    style={{
                                        background: `linear-gradient(135deg, ${event.colors.primary}40, ${event.colors.secondary}40)`,
                                        borderLeft: `4px solid ${event.colors.primary}`
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl">{event.emoji}</div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{event.name}</h3>
                                            <p className="text-sm text-gray-300">{event.description}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs">
                                                <Clock size={12} className="text-yellow-400" />
                                                <span className="text-yellow-400">{getRemainingDaysLocal(event)} days remaining</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-yellow-400 font-bold">+{event.rewards.coins} 🪙</div>
                                            {event.rewards.skin && (
                                                <div className="text-xs text-purple-400">+ Exclusive Skin</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upcoming Events */}
                <div>
                    <h2 className="text-lg font-bold mb-3 text-gray-400">Upcoming Events</h2>
                    <div className="space-y-3">
                        {upcomingEvents.map(event => (
                            <div
                                key={event.id}
                                className="p-4 rounded-xl bg-gray-800/50 border border-gray-700"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl opacity-50">{event.emoji}</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold">{event.name}</h3>
                                        <p className="text-sm text-gray-500">{event.description}</p>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Starts: {event.startMonth}/{event.startDay}
                                        </div>
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                        Coming Soon
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {activeEvents.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                        <p>No active events right now.</p>
                        <p className="text-sm">Check back during holidays!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeasonalEvents;
