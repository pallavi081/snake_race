import React, { useState, useEffect } from 'react';
import { Users, Shield, Calendar, Search, Save, X, RefreshCw, Star, Coins, BarChart2, Trash2, List, Lock, LogOut, Megaphone, Clock } from 'lucide-react';
import { getAllUsers, getGlobalSettings, updateGlobalSettings, syncPlayerToCloud, getSystemStats, getGlobalLeaderboard, deleteLeaderboardEntry } from '../utils/cloudStorage';
import { useAdmin } from '../hooks/useAdmin';

interface AdminUser {
    id: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    playerData?: {
        coins: number;
        wins: number;
        [key: string]: any;
    };
    [key: string]: any;
}

interface LeaderboardEntry {
    id?: string;
    name: string;
    score: number;
    mode: string;
    photoURL?: string;
    [key: string]: any;
}

const AdminPanel: React.FC = () => {
    // 1. Session & Auth State
    const [isPasswordAuthenticated, setIsPasswordAuthenticated] = useState<boolean>(() => {
        return sessionStorage.getItem('admin_auth') === 'true';
    });
    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [loginError, setLoginError] = useState('');

    const { isAdmin, adminLoading } = useAdmin();
    const [activeTab, setActiveTab] = useState<'users' | 'events' | 'stats' | 'leaderboard' | 'system'>('stats');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [systemStats, setSystemStats] = useState<any>(null);
    const [globalSettings, setGlobalSettings] = useState<any>({ eventOverrides: {} });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    // 2. Data Loading Logic
    useEffect(() => {
        console.log('[AdminPanel] Effect triggered. isPasswordCheck:', isPasswordAuthenticated, 'isAdmin:', isAdmin, 'adminLoading:', adminLoading);

        if (isPasswordAuthenticated) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [isPasswordAuthenticated, isAdmin, adminLoading]);

    const loadData = async () => {
        console.log('[AdminPanel] Starting loadData...');
        setLoading(true);
        try {
            const [usersData, settingsData, statsData, leaderboardData] = await Promise.all([
                getAllUsers(50),
                getGlobalSettings(),
                getSystemStats(),
                getGlobalLeaderboard()
            ]);
            console.log('[AdminPanel] Data loaded successfully');
            setUsers(usersData);
            setGlobalSettings(settingsData || { eventOverrides: {} });
            setSystemStats(statsData);
            setLeaderboard(leaderboardData);
        } catch (error) {
            console.error('[AdminPanel] Failed to load data:', error);
        } finally {
            console.log('[AdminPanel] loadData complete, setting loading to false');
            setLoading(false);
        }
    };

    // 3. Handlers
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const envUser = import.meta.env.VITE_ADMIN_USER;
        const envPass = import.meta.env.VITE_ADMIN_PASS;

        if (loginUser === envUser && loginPass === envPass) {
            sessionStorage.setItem('admin_auth', 'true');
            setIsPasswordAuthenticated(true);
            setLoginError('');
        } else {
            setLoginError('Invalid username or password');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('admin_auth');
        setIsPasswordAuthenticated(false);
    };

    const handleToggleEvent = async (eventId: string) => {
        const current = globalSettings.eventOverrides?.[eventId];
        let newVal: boolean | undefined;

        if (current === true) newVal = false;
        else if (current === false) newVal = undefined;
        else newVal = true;

        const newSettings = {
            ...globalSettings,
            eventOverrides: {
                ...globalSettings.eventOverrides,
                [eventId]: newVal
            }
        };
        setGlobalSettings(newSettings);
        await updateGlobalSettings(newSettings);
    };

    const handleUpdateEventDates = async (eventId: string, field: 'startDate' | 'endDate', value: string) => {
        const newSettings = {
            ...globalSettings,
            eventDates: {
                ...globalSettings.eventDates,
                [eventId]: {
                    ...globalSettings.eventDates?.[eventId],
                    [field]: value
                }
            }
        };
        setGlobalSettings(newSettings);
        await updateGlobalSettings(newSettings);
    };

    const handleUpdateSystemSetting = async (field: string, value: any) => {
        const newSettings = {
            ...globalSettings,
            [field]: value
        };
        setGlobalSettings(newSettings);
        await updateGlobalSettings(newSettings);
    };

    const handleSaveUser = async () => {
        if (!editingUser) return;
        try {
            await syncPlayerToCloud(editingUser.id, editingUser);
            setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
            setEditingUser(null);
            alert('User updated successfully!');
        } catch (e) {
            alert('Failed to update user');
        }
    };

    const handleDeleteLeaderboard = async (entryId: string) => {
        if (!confirm('Are you sure you want to remove this entry?')) return;
        try {
            await deleteLeaderboardEntry(entryId);
            setLeaderboard(leaderboard.filter(e => e.id !== entryId));
        } catch (e) {
            alert('Failed to delete entry');
        }
    };

    // 4. Render Logic (Login Screen)
    if (!isPasswordAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg ring-4 ring-indigo-600/20">
                            <Lock size={32} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-center mb-1 bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">Admin Portal</h1>
                    <p className="text-gray-500 text-center text-sm mb-8">Please enter your credentials to continue</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-[10px] uppercase font-black text-gray-500 ml-1 mb-1 block tracking-widest">Username</label>
                            <input
                                type="text"
                                value={loginUser}
                                onChange={(e) => setLoginUser(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono"
                                placeholder="Enter Username"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-black text-gray-500 ml-1 mb-1 block tracking-widest">Password</label>
                            <input
                                type="password"
                                value={loginPass}
                                onChange={(e) => setLoginPass(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono"
                                placeholder="Enter Password"
                                required
                            />
                        </div>
                        {loginError && <p className="text-red-500 text-xs font-bold text-center">{loginError}</p>}
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95"
                        >
                            Log In
                        </button>
                    </form>

                    <button onClick={() => window.location.href = '/'} className="w-full text-gray-500 text-xs mt-6 hover:text-white transition-colors">
                        Return to Game
                    </button>
                </div>
            </div>
        );
    }

    // 5. Render Logic (Loading & Dashboard)
    if (loading && isPasswordAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
                <RefreshCw className="animate-spin mb-4 text-blue-500" size={48} />
                <div className="text-xl font-bold">Verifying Admin Access...</div>
                <div className="text-gray-500 text-sm mt-2">Checking credentials and loading dashboard</div>
            </div>
        );
    }

    const filteredUsers = users.filter(u =>
        (u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.id.includes(searchTerm))
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans">
            {/* Header */}
            <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-600 p-2 rounded-lg">
                            <Shield size={24} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">Snake Race <span className="text-red-500 text-sm font-mono ml-2 uppercase">Admin</span></h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors">
                            <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
                        </button>
                        <button onClick={() => window.location.href = '/'} className="text-sm text-gray-400 hover:text-white transition-colors">Exit</button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar */}
                <aside className="md:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <BarChart2 size={18} /> System Stats
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <Users size={18} /> User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'leaderboard' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <List size={18} /> Leaderboard
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'events' ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <Calendar size={18} /> Seasonal Events
                    </button>
                    <button
                        onClick={() => setActiveTab('system')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'system' ? 'bg-orange-600 text-white shadow-lg' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <Shield size={18} /> System Control
                    </button>
                </aside>

                {/* Main Content */}
                <main className="md:col-span-3">
                    {activeTab === 'stats' ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                                    <div className="text-gray-400 text-sm mb-1 uppercase font-bold tracking-wider">Total Users</div>
                                    <div className="text-4xl font-black text-blue-500">{systemStats?.totalUsers || 0}</div>
                                </div>
                                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                                    <div className="text-gray-400 text-sm mb-1 uppercase font-bold tracking-wider">Top Scores</div>
                                    <div className="text-4xl font-black text-emerald-500">{systemStats?.totalLeaderboardEntries || 0}</div>
                                </div>
                                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                                    <div className="text-gray-400 text-sm mb-1 uppercase font-bold tracking-wider">Total Coins</div>
                                    <div className="text-4xl font-black text-yellow-500">🪙 {systemStats?.totalCoinsInCirculation?.toLocaleString() || 0}</div>
                                </div>
                            </div>

                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                                <h3 className="font-bold mb-4">Admin Activity</h3>
                                <div className="text-sm text-gray-400">
                                    Last data sync performed at: <span className="text-white font-mono">{systemStats?.lastUpdated || 'Never'}</span>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'users' ? (
                        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                            <div className="p-4 border-b border-gray-800 flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or ID..."
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button onClick={loadData} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-950 text-gray-400 font-mono text-xs uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Player</th>
                                            <th className="px-4 py-3">Coins</th>
                                            <th className="px-4 py-3">Wins</th>
                                            <th className="px-4 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <img src={user.photoURL || 'https://via.placeholder.com/32'} className="w-8 h-8 rounded-full bg-gray-800" />
                                                        <div>
                                                            <div className="font-bold">{user.displayName || 'Anonymous'}</div>
                                                            <div className="text-[10px] text-gray-500 font-mono">{user.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-yellow-500 font-bold">🪙 {user.playerData?.coins || 0}</td>
                                                <td className="px-4 py-3 text-emerald-400">🏆 {user.playerData?.wins || 0}</td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => setEditingUser(user)}
                                                        className="text-blue-400 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : activeTab === 'system' ? (
                        <div className="space-y-6">
                            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Shield className="text-orange-400" /> Maintenance Mode
                                </h2>
                                <p className="text-sm text-gray-400 mb-6">
                                    Put the game into maintenance. Players will be blocked from joining matches.
                                </p>
                                <div className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-xl">
                                    <div>
                                        <div className="font-bold">Enable Maintenance Mode</div>
                                        <div className="text-xs text-gray-500">Global lock on all game arenas</div>
                                    </div>
                                    <button
                                        onClick={() => handleUpdateSystemSetting('maintenanceMode', !globalSettings.maintenanceMode)}
                                        className={`px-6 py-2 rounded-lg font-black transition-all ${globalSettings.maintenanceMode ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'
                                            }`}
                                    >
                                        {globalSettings.maintenanceMode ? 'ENABLED' : 'DISABLED'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Megaphone className="text-blue-400" /> Global Announcement
                                </h2>
                                <p className="text-sm text-gray-400 mb-6">
                                    A banner message that appears for all users on the home screen.
                                </p>
                                <div className="space-y-4">
                                    <textarea
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500"
                                        placeholder="Type your global announcement here..."
                                        rows={3}
                                        value={globalSettings.announcement || ''}
                                        onChange={(e) => setGlobalSettings({ ...globalSettings, announcement: e.target.value })}
                                    />
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => handleUpdateSystemSetting('announcement', '')}
                                            className="px-4 py-2 text-xs text-gray-500 hover:text-white"
                                        >
                                            Clear
                                        </button>
                                        <button
                                            onClick={() => handleUpdateSystemSetting('announcement', globalSettings.announcement)}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold flex items-center gap-2"
                                        >
                                            <Save size={16} /> Update Announcement
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'leaderboard' ? (
                        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                                <h2 className="font-bold">Global Leaderboard Entries</h2>
                                <button onClick={loadData} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-950 text-gray-400 font-mono text-xs uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Rank</th>
                                            <th className="px-4 py-3">Player</th>
                                            <th className="px-4 py-3">Score</th>
                                            <th className="px-4 py-3">Mode</th>
                                            <th className="px-4 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {leaderboard.map((entry, idx) => (
                                            <tr key={entry.id || idx} className="hover:bg-gray-800/50 transition-colors">
                                                <td className="px-4 py-3 font-mono text-gray-500">#{idx + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <img src={entry.photoURL || 'https://via.placeholder.com/24'} className="w-6 h-6 rounded-full" />
                                                        <span className="font-bold">{entry.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-yellow-400 font-bold">{entry.score.toLocaleString()}</td>
                                                <td className="px-4 py-3 capitalize text-xs text-gray-400">{entry.mode}</td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => entry.id && handleDeleteLeaderboard(entry.id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete Entry"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Calendar className="text-purple-400" /> Event Settings
                                </h2>
                                <p className="text-sm text-gray-400 mb-6">
                                    Force seasonal events to be active or set custom dates for this year.
                                </p>
                                <div className="grid grid-cols-1 gap-6">
                                    {['diwali', 'christmas', 'valentine', 'chhath', 'dussehra', 'eid'].map(eventId => {
                                        const state = globalSettings.eventOverrides?.[eventId];
                                        const dates = globalSettings.eventDates?.[eventId] || {};
                                        return (
                                            <div key={eventId} className="bg-gray-950 border border-gray-800 rounded-xl p-6">
                                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-900">
                                                    <div>
                                                        <div className="font-bold capitalize text-lg flex items-center gap-2">
                                                            {eventId}
                                                            {state === true && <span className="text-[10px] bg-green-900/40 text-green-500 px-2 py-0.5 rounded-full uppercase">Forced Active</span>}
                                                            {state === false && <span className="text-[10px] bg-red-900/40 text-red-500 px-2 py-0.5 rounded-full uppercase">Forced Inactive</span>}
                                                        </div>
                                                        <div className="text-xs text-gray-500">Mode: {state === true ? 'Active' : state === false ? 'Blocked' : 'Default (Dates)'}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggleEvent(eventId)}
                                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${state === true ? 'bg-green-600' :
                                                            state === false ? 'bg-red-600' : 'bg-gray-800'
                                                            }`}
                                                    >
                                                        {state === true ? 'ACTIVE' : state === false ? 'BLOCKED' : 'DEFAULT'}
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Custom Start Date</label>
                                                        <div className="relative">
                                                            <Clock className="absolute left-3 top-2.5 text-gray-600" size={14} />
                                                            <input
                                                                type="date"
                                                                className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-purple-500"
                                                                value={dates.startDate || ''}
                                                                onChange={(e) => handleUpdateEventDates(eventId, 'startDate', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Custom End Date</label>
                                                        <div className="relative">
                                                            <Clock className="absolute left-3 top-2.5 text-gray-600" size={14} />
                                                            <input
                                                                type="date"
                                                                className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-purple-500"
                                                                value={dates.endDate || ''}
                                                                onChange={(e) => handleUpdateEventDates(eventId, 'endDate', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                            <h3 className="font-bold">Edit Player Info</h3>
                            <button onClick={() => setEditingUser(null)}><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Display Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm"
                                    value={editingUser.displayName || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Coins</label>
                                    <div className="relative">
                                        <Coins className="absolute left-3 top-3 text-yellow-500" size={16} />
                                        <input
                                            type="number"
                                            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 pl-10 text-sm"
                                            value={editingUser.playerData?.coins || 0}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                playerData: { ...editingUser.playerData!, coins: parseInt(e.target.value) || 0 }
                                            })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Wins</label>
                                    <div className="relative">
                                        <Star className="absolute left-3 top-3 text-emerald-400" size={16} />
                                        <input
                                            type="number"
                                            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 pl-10 text-sm"
                                            value={editingUser.playerData?.wins || 0}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                playerData: { ...editingUser.playerData!, wins: parseInt(e.target.value) || 0 }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleSaveUser}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                            >
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
