import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Send, ExternalLink, User } from 'lucide-react';
import {
    sendChatMessage,
    subscribeToChat,
    ChatMessage
} from '../utils/socialFirestore';

interface GlobalChatProps {
    onClose: () => void;
    userId?: string;
    userName?: string;
    userPhoto?: string;
}

const GlobalChat: React.FC<GlobalChatProps> = ({ onClose, userId, userName, userPhoto }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Subscribe to real-time messages
        const unsubscribe = subscribeToChat((msgs) => {
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Scroll to bottom on new messages
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !userId || !userName) return;

        setSending(true);
        await sendChatMessage(userId, userName, newMessage.trim(), userPhoto);
        setNewMessage('');
        setSending(false);
        inputRef.current?.focus();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-lg h-[80vh] max-h-[600px] flex flex-col border border-gray-700">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <MessageCircle className="text-green-400" /> Global Chat
                        </h2>
                        <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                        {messages.length > 0 ? `${messages.length} messages` : 'Chat with other players!'}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No messages yet!</p>
                            <p className="text-sm mt-2">Be the first to say hello 👋</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.userId === userId;
                            return (
                                <div
                                    key={msg.id || idx}
                                    className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                                >
                                    {msg.photoURL ? (
                                        <img src={msg.photoURL} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                                            <User size={14} />
                                        </div>
                                    )}
                                    <div className={`max-w-[70%] ${isMe ? 'text-right' : ''}`}>
                                        <div className={`text-xs mb-1 ${isMe ? 'text-blue-400' : 'text-gray-400'}`}>
                                            {msg.name} • {formatTime(msg.timestamp)}
                                        </div>
                                        <div className={`inline-block px-3 py-2 rounded-2xl ${isMe
                                                ? 'bg-blue-600 text-white rounded-br-sm'
                                                : 'bg-gray-700 text-gray-100 rounded-bl-sm'
                                            }`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {userId ? (
                    <div className="p-3 border-t border-gray-700 flex-shrink-0">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                maxLength={500}
                                className="flex-1 bg-gray-700 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                disabled={sending}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!newMessage.trim() || sending}
                                className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:opacity-50 rounded-full transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-3 border-t border-gray-700 text-center text-sm text-gray-400 flex-shrink-0">
                        Sign in to chat with other players
                    </div>
                )}

                {/* Privy Chat Link */}
                <div className="p-2 border-t border-gray-700 flex-shrink-0">
                    <a
                        href="https://privy-chat.onrender.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg text-purple-300 text-xs transition-colors"
                    >
                        <ExternalLink size={12} />
                        Need private chat? Use Privy Chat - Fully Encrypted
                    </a>
                </div>
            </div>
        </div>
    );
};

export default GlobalChat;
