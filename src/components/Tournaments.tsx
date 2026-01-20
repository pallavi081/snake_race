import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Award, Clock, Users, Crown, Gift } from 'lucide-react';
import {
    getCurrentTournament,
    getTournamentLeaderboard,
    submitTournamentScore,
    Tournament,
    TournamentEntry,
    getCurrentWeekId
} from '../utils/socialFirestore';

interface TournamentsProps {
    onClose: () => void;
    userId?: string;
    userName?: string;
    userPhoto?: string;
}

const Tournaments: React.FC<TournamentsProps> = ({ onClose, userId, userName, userPhoto }) => {
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [leaderboard, setLeaderboard] = useState<TournamentEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [myRank, setMyRank] = useState<number | null>(null);

    useEffect(() => {
        loadTournamentData();
    }, [userId]);

    const loadTournamentData = async () => {
        setLoading(true);
        const [tournamentData, entries] = await Promise.all([
            getCurrentTournament(),
            getTournamentLeaderboard()
        ]);

        setTournament(tournamentData);
        setLeaderboard(entries);

        // Find my rank
        if (userId) {
            const rank = entries.findIndex(e => e.userId === userId);
            setMyRank(rank >= 0 ? rank + 1 : null);
        }

        setLoading(false);
    };

    const getRankStyle = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-amber-400 text-black';
        if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-black';
        if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-orange-500 text-white';
        return 'bg-gray-700 text-white';
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown size={18} className="text-yellow-300" />;
        if (rank === 2) return <Medal size={16} className="text-gray-200" />;
        if (rank === 3) return <Award size={16} className="text-amber-400" />;
        return null;
    };

    const getTimeRemaining = () => {
        if (!tournament) return 'Loading...';
        const now = new Date();
        const end = tournament.endDate?.toDate?.() || new Date();
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return 'Tournament Ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h remaining`;
        return `${hours}h remaining`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-700">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Trophy className="text-yellow-400" /> Weekly Tournament
                        </h2>
                        <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                            <Clock size={14} /> {getTimeRemaining()}
                        </span>
                        <span className="flex items-center gap-1">
                            <Users size={14} /> {leaderboard.length} players
                        </span>
                    </div>
                </div>

                {/* Prizes */}
                <div className="p-3 bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-b border-gray-700 flex-shrink-0">
                    <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                        <Gift size={12} /> Prizes
                    </div>
                    <div className="flex justify-around text-center">
                        <div>
                            <div className="text-2xl">🥇</div>
                            <div className="text-yellow-400 font-bold">500 🪙</div>
                            <div className="text-xs text-gray-500">1st Place</div>
                        </div>
                        <div>
                            <div className="text-2xl">🥈</div>
                            <div className="text-gray-300 font-bold">250 🪙</div>
                            <div className="text-xs text-gray-500">2nd Place</div>
                        </div>
                        <div>
                            <div className="text-2xl">🥉</div>
                            <div className="text-amber-500 font-bold">100 🪙</div>
                            <div className="text-xs text-gray-500">3rd Place</div>
                        </div>
                    </div>
                </div>

                {/* My Rank */}
                {userId && myRank && (
                    <div className="p-3 bg-blue-900/30 border-b border-gray-700 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Your Rank</span>
                            <span className="text-lg font-bold text-blue-400">#{myRank}</span>
                        </div>
                    </div>
                )}

                {/* Leaderboard */}
                <div className="flex-1 overflow-y-auto p-3">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading tournament...</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No entries yet this week!</p>
                            <p className="text-sm mt-2">Play any game mode to compete!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {leaderboard.slice(0, 10).map((entry, idx) => (
                                <div
                                    key={entry.userId || idx}
                                    className={`flex items-center gap-3 p-3 rounded-lg ${idx < 3 ? 'bg-gradient-to-r from-gray-700/80 to-gray-800' : 'bg-gray-700/50'
                                        } ${entry.userId === userId ? 'ring-2 ring-blue-500' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(idx + 1)}`}>
                                        {idx + 1}
                                    </div>

                                    {entry.photoURL ? (
                                        <img src={entry.photoURL} alt="" className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm">
                                            {entry.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {getRankIcon(idx + 1)}
                                            <span className="font-medium truncate">{entry.name}</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-lg font-bold text-yellow-400">
                                            {entry.score.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-700 text-center text-xs text-gray-500 flex-shrink-0">
                    Week {getCurrentWeekId()} • Top scores from all game modes
                </div>
            </div>
        </div>
    );
};

export default Tournaments;
