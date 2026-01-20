import React, { useState, useEffect } from 'react';
import { X, User, Trophy, Star, Gamepad2, Crown, Swords, Target, Clock, Edit2 } from 'lucide-react';
import { getProfile, updateProfile, PlayerProfile as ProfileData } from '../utils/socialFirestore';
import { storage } from '../utils/storage';

interface PlayerProfileProps {
    onClose: () => void;
    userId?: string;
    userName?: string;
    userPhoto?: string;
    viewingUserId?: string; // If viewing another player's profile
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({
    onClose,
    userId,
    userName,
    userPhoto,
    viewingUserId
}) => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [localStats, setLocalStats] = useState(storage.getPlayer());
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [bio, setBio] = useState('');

    const isOwnProfile = !viewingUserId || viewingUserId === userId;
    const targetUserId = viewingUserId || userId;

    useEffect(() => {
        loadProfile();
    }, [targetUserId]);

    const loadProfile = async () => {
        if (!targetUserId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const profileData = await getProfile(targetUserId);
        setProfile(profileData);
        setBio(profileData?.bio || '');

        // If own profile, sync local stats to cloud
        if (isOwnProfile && userId) {
            const player = storage.getPlayer();
            const achievements = storage.getAchievements();
            const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;

            await updateProfile(userId, {
                userId: userId,
                name: userName || player.name,
                photoURL: userPhoto || undefined,
                totalScore: player.totalScore,
                totalKills: player.totalKills,
                gamesPlayed: player.gamesPlayed,
                wins: player.wins,
                longestStreak: player.longestStreak,
                achievementsUnlocked: unlockedCount
            });
        }

        setLoading(false);
    };

    const handleSaveBio = async () => {
        if (!userId) return;
        await updateProfile(userId, { bio });
        setProfile(prev => prev ? { ...prev, bio } : null);
        setEditing(false);
    };

    const statCards = [
        { icon: <Gamepad2 size={20} />, label: 'Games Played', value: profile?.gamesPlayed || localStats.gamesPlayed, color: 'text-blue-400' },
        { icon: <Trophy size={20} />, label: 'Wins', value: profile?.wins || localStats.wins, color: 'text-yellow-400' },
        { icon: <Swords size={20} />, label: 'Total Kills', value: profile?.totalKills || localStats.totalKills, color: 'text-red-400' },
        { icon: <Target size={20} />, label: 'High Score', value: (profile?.totalScore || localStats.totalScore).toLocaleString(), color: 'text-green-400' },
        { icon: <Star size={20} />, label: 'Achievements', value: `${profile?.achievementsUnlocked || 0}/47`, color: 'text-purple-400' },
        { icon: <Clock size={20} />, label: 'Best Streak', value: `${profile?.longestStreak || localStats.longestStreak} days`, color: 'text-orange-400' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-md max-h-[85vh] flex flex-col border border-gray-700 overflow-hidden">
                {/* Header with Avatar */}
                <div className="relative bg-gradient-to-b from-blue-600/30 to-gray-800 p-6 flex-shrink-0">
                    <button onClick={onClose} className="absolute top-3 right-3 p-1 hover:bg-gray-700/50 rounded">
                        <X size={24} />
                    </button>

                    <div className="flex flex-col items-center">
                        {userPhoto || profile?.photoURL ? (
                            <img
                                src={userPhoto || profile?.photoURL}
                                alt=""
                                className="w-20 h-20 rounded-full border-4 border-gray-700 shadow-lg"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-600">
                                <User size={40} className="text-gray-400" />
                            </div>
                        )}

                        <h2 className="mt-3 text-xl font-bold flex items-center gap-2">
                            {userName || profile?.name || 'Player'}
                            {(profile?.wins || 0) >= 10 && <Crown size={18} className="text-yellow-400" />}
                        </h2>

                        {/* Bio */}
                        {isOwnProfile ? (
                            editing ? (
                                <div className="mt-2 w-full flex gap-2">
                                    <input
                                        type="text"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Add a bio..."
                                        maxLength={100}
                                        className="flex-1 bg-gray-700 rounded px-3 py-1 text-sm text-center"
                                    />
                                    <button onClick={handleSaveBio} className="px-3 py-1 bg-green-600 rounded text-sm">
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="mt-2 text-sm text-gray-400 hover:text-gray-300 flex items-center gap-1"
                                >
                                    {bio || 'Add a bio...'} <Edit2 size={12} />
                                </button>
                            )
                        ) : (
                            profile?.bio && <p className="mt-2 text-sm text-gray-400">{profile.bio}</p>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {statCards.map((stat, idx) => (
                                <div key={idx} className="bg-gray-700/50 rounded-lg p-3 text-center">
                                    <div className={`${stat.color} flex justify-center mb-2`}>
                                        {stat.icon}
                                    </div>
                                    <div className="text-lg font-bold">{stat.value}</div>
                                    <div className="text-xs text-gray-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Favorite Mode */}
                    {profile?.favoriteMode && (
                        <div className="mt-4 bg-gray-700/30 rounded-lg p-3 text-center">
                            <div className="text-xs text-gray-400 mb-1">Favorite Mode</div>
                            <div className="text-sm font-medium capitalize">{profile.favoriteMode}</div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-700 text-center text-xs text-gray-500 flex-shrink-0">
                    {isOwnProfile ? 'Your public profile' : 'Player profile'}
                </div>
            </div>
        </div>
    );
};

export default PlayerProfile;
