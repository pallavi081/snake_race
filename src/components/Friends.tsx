import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Copy, Check, Trash2, Search, ExternalLink } from 'lucide-react';
import {
    getFriends,
    addFriend,
    removeFriend,
    findUserByCode,
    saveFriendCode,
    generateFriendCode,
    Friend
} from '../utils/socialFirestore';

interface FriendsProps {
    onClose: () => void;
    userId?: string;
    userName?: string;
    userPhoto?: string;
}

const Friends: React.FC<FriendsProps> = ({ onClose, userId, userName, userPhoto }) => {
    const [tab, setTab] = useState<'friends' | 'add'>('friends');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [friendCode, setFriendCode] = useState('');
    const [myCode, setMyCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [searchResult, setSearchResult] = useState<{ userId: string; name: string; photoURL?: string } | null>(null);
    const [searchError, setSearchError] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (userId) {
            loadFriends();
            const code = generateFriendCode(userId);
            setMyCode(code);
            saveFriendCode(userId, userName || 'Player', userPhoto);
        }
    }, [userId, userName, userPhoto]);

    const loadFriends = async () => {
        if (!userId) return;
        setLoading(true);
        const friendsList = await getFriends(userId);
        setFriends(friendsList);
        setLoading(false);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(myCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSearch = async () => {
        if (!friendCode.trim()) return;
        setSearchError('');
        setSearchResult(null);

        const result = await findUserByCode(friendCode.trim());
        if (result) {
            if (result.userId === userId) {
                setSearchError("That's your own code!");
            } else if (friends.some(f => f.userId === result.userId)) {
                setSearchError("Already friends!");
            } else {
                setSearchResult(result);
            }
        } else {
            setSearchError('No user found with this code');
        }
    };

    const handleAddFriend = async () => {
        if (!userId || !searchResult) return;
        setAdding(true);

        const success = await addFriend(userId, searchResult.userId, searchResult.name, searchResult.photoURL);
        if (success) {
            setFriends(prev => [...prev, {
                userId: searchResult.userId,
                name: searchResult.name,
                photoURL: searchResult.photoURL
            } as Friend]);
            setSearchResult(null);
            setFriendCode('');
            setTab('friends');
        }
        setAdding(false);
    };

    const handleRemoveFriend = async (friendId: string) => {
        if (!userId || !confirm('Remove this friend?')) return;

        const success = await removeFriend(userId, friendId);
        if (success) {
            setFriends(prev => prev.filter(f => f.userId !== friendId));
        }
    };

    if (!userId) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 text-center border border-gray-700">
                    <Users size={48} className="mx-auto mb-4 text-gray-500" />
                    <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
                    <p className="text-gray-400 mb-4">Sign in with Google to add friends and see their progress!</p>
                    <button onClick={onClose} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-md max-h-[85vh] flex flex-col border border-gray-700">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Users className="text-blue-400" /> Friends
                        </h2>
                        <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="p-2 border-b border-gray-700 flex gap-2 flex-shrink-0">
                    <button
                        onClick={() => setTab('friends')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${tab === 'friends' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                    >
                        <Users size={16} /> My Friends ({friends.length})
                    </button>
                    <button
                        onClick={() => setTab('add')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${tab === 'add' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                    >
                        <UserPlus size={16} /> Add Friend
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3">
                    {tab === 'friends' ? (
                        loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                            </div>
                        ) : friends.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Users size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No friends yet!</p>
                                <p className="text-sm mt-2">Share your code to add friends</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {friends.map((friend) => (
                                    <div
                                        key={friend.userId}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50"
                                    >
                                        {friend.photoURL ? (
                                            <img src={friend.photoURL} alt="" className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                                                {friend.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{friend.name}</div>
                                            <div className="text-xs text-gray-400">Friend</div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFriend(friend.userId)}
                                            className="p-2 hover:bg-red-900/50 rounded text-red-400"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="space-y-4">
                            {/* My Code */}
                            <div className="bg-gray-700/50 rounded-lg p-4">
                                <div className="text-sm text-gray-400 mb-2">Your Friend Code</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-800 rounded-lg px-4 py-3 text-center font-mono text-xl tracking-widest font-bold text-blue-400">
                                        {myCode}
                                    </div>
                                    <button
                                        onClick={handleCopyCode}
                                        className={`p-3 rounded-lg transition-colors ${copied ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'
                                            }`}
                                    >
                                        {copied ? <Check size={20} /> : <Copy size={20} />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Share this code with friends!
                                </p>
                            </div>

                            {/* Add by Code */}
                            <div className="bg-gray-700/50 rounded-lg p-4">
                                <div className="text-sm text-gray-400 mb-2">Add by Code</div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={friendCode}
                                        onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                                        placeholder="Enter code..."
                                        maxLength={6}
                                        className="flex-1 bg-gray-800 rounded-lg px-4 py-3 text-center font-mono text-lg tracking-widest uppercase"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg"
                                    >
                                        <Search size={20} />
                                    </button>
                                </div>

                                {searchError && (
                                    <p className="text-red-400 text-sm mt-2 text-center">{searchError}</p>
                                )}

                                {searchResult && (
                                    <div className="mt-3 bg-gray-800 rounded-lg p-3 flex items-center gap-3">
                                        {searchResult.photoURL ? (
                                            <img src={searchResult.photoURL} alt="" className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                                                {searchResult.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="font-medium">{searchResult.name}</div>
                                        </div>
                                        <button
                                            onClick={handleAddFriend}
                                            disabled={adding}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium flex items-center gap-2"
                                        >
                                            <UserPlus size={16} />
                                            {adding ? 'Adding...' : 'Add'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with Privy Chat Link */}
                <div className="p-3 border-t border-gray-700 flex-shrink-0">
                    <a
                        href="https://privy-chat.onrender.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg text-purple-300 text-sm transition-colors"
                    >
                        <ExternalLink size={14} />
                        Private Chat (Privy) - Fully Encrypted
                    </a>
                    <p className="text-xs text-gray-500 text-center mt-2">
                        🔒 No one can see your private messages
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Friends;
