import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Send,
    Search,
    Plus,
    MoreVertical,
    ChevronLeft,
    X,
    Smile,
    Paperclip,
    Check,
    CheckCheck,
    Loader2,
    User,
    ShieldCheck,
    Download,
    FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    getConversations, 
    getMessageThread, 
    sendMessage, 
    uploadAttachment
} from '../../services/messageService';
import OptimizedImage from '../../components/OptimizedImage';
import axios from 'axios';

const ProfessionalMessages = () => {
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    
    // UI State
    const [isMobileListOpen, setIsMobileListOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    
    // Data State
    const [conversations, setConversations] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [thread, setThread] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingThread, setLoadingThread] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [composeData, setComposeData] = useState({ to: '', content: '' });

    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        fetchConversations();
        // Polling for new conversations/unread counts
        const convInterval = setInterval(fetchConversations, 10000);
        return () => clearInterval(convInterval);
    }, []);

    useEffect(() => {
        let threadInterval;
        if (selectedContact) {
            fetchThread(selectedContact._id);
            // Polling for new messages in active thread
            threadInterval = setInterval(() => fetchThread(selectedContact._id, true), 4000);
        }
        return () => {
            if (threadInterval) clearInterval(threadInterval);
        };
    }, [selectedContact]);

    useEffect(() => {
        scrollToBottom();
    }, [thread]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            setLoadingConversations(true);
            const response = await getConversations();
            if (response.success) {
                setConversations(response.data);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoadingConversations(false);
        }
    };

    const fetchThread = async (userId, isPolling = false) => {
        try {
            if (!isPolling) setLoadingThread(true);
            const response = await getMessageThread(userId);
            if (response.success) {
                // Only update state if message count changed to avoid unnecessary re-renders
                setThread(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(response.data)) {
                        return response.data;
                    }
                    return prev;
                });
                
                // If there are unread messages, refresh conversations to update sidebar counts
                const hasUnread = response.data.some(m => !m.isRead && m.receiver._id === currentUserId);
                if (hasUnread) {
                    fetchConversations();
                    // Trigger global count refresh
                    window.dispatchEvent(new Event('refreshUnreadCount'));
                }
            }
        } catch (error) {
            if (!isPolling) console.error('Error fetching thread:', error);
        } finally {
            if (!isPolling) setLoadingThread(false);
        }
    };

    const handleSelectConversation = (conv) => {
        setSelectedContact(conv.otherUser);
        fetchThread(conv.otherUser._id);
        setIsMobileListOpen(false);
        setIsMoreMenuOpen(false);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        setSending(true);
        try {
            const response = await sendMessage({
                receiverId: selectedContact._id,
                subject: 'Professional Inquiry Response',
                content: newMessage
            });

            if (response.success) {
                const tempMsg = {
                    _id: Date.now().toString(),
                    sender: { _id: currentUserId },
                    receiver: { _id: selectedContact._id },
                    content: newMessage,
                    createdAt: new Date().toISOString(),
                    isRead: false
                };
                setThread(prev => [...prev, tempMsg]);
                setNewMessage('');
                fetchConversations();
                // Trigger global count refresh
                window.dispatchEvent(new Event('refreshUnreadCount'));
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = () => fileInputRef.current?.click();

    const onFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedContact) return;

        try {
            setSending(true);
            const uploadRes = await uploadAttachment(file);
            if (uploadRes.success) {
                const attachment = uploadRes.data;
                const response = await sendMessage({
                    receiverId: selectedContact._id,
                    subject: 'Client Resource Share',
                    content: `Attached File: ${attachment.filename}`,
                    attachments: [attachment]
                });

                if (response.success) {
                    const tempMsg = {
                        _id: Date.now().toString(),
                        sender: { _id: currentUserId },
                        receiver: { _id: selectedContact._id },
                        content: `Attached File: ${attachment.filename}`,
                        attachments: [attachment],
                        createdAt: new Date().toISOString(),
                        isRead: false
                    };
                    setThread(prev => [...prev, tempMsg]);
                    fetchConversations();
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setSending(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleComposeNew = async (e) => {
        e.preventDefault();
        if (!composeData.to || !composeData.content) return;
        
        setSending(true);
        try {
            let targetId = null;
            if (composeData.to.includes('@')) {
                const token = localStorage.getItem('token');
                const userRes = await axios.get(`/api/users/find?email=${composeData.to}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (userRes.data?.data?._id) targetId = userRes.data.data._id;
            } else {
                targetId = composeData.to;
            }

            if (!targetId) throw new Error('Client not found');

            const response = await sendMessage({
                receiverId: targetId,
                subject: 'Proactive Outreach',
                content: composeData.content
            });

            if (response.success) {
                setIsComposeOpen(false);
                setComposeData({ to: '', content: '' });
                fetchConversations();
                // Select them
                fetchThread(targetId);
                // We'd need to fetch user details to properly set SelectedContact here
                // but for now, we'll just refresh conversations
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const filteredConversations = conversations.filter(conv => 
        conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden h-[700px] flex animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Contacts Sidebar (Internal) */}
            <aside className={`
                w-full lg:w-80 border-r border-slate-50 flex flex-col bg-slate-50/30
                ${!isMobileListOpen ? 'hidden lg:flex' : 'flex'}
            `}>
                <div className="p-8 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Active Clients</h3>
                        <button 
                            onClick={() => setIsComposeOpen(true)}
                            className="p-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-all shadow-sm"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Find client..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-teal-500/20 outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loadingConversations ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 p-4 animate-pulse opacity-50">
                                <div className="w-10 h-10 bg-slate-200 rounded-2xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                                    <div className="h-2 bg-slate-100 rounded w-full" />
                                </div>
                            </div>
                        ))
                    ) : filteredConversations.length > 0 ? (
                        filteredConversations.map((conv) => (
                            <button
                                key={conv.otherUser._id}
                                onClick={() => handleSelectConversation(conv)}
                                className={`w-full flex items-center gap-3 p-4 rounded-3xl transition-all text-left group
                                    ${selectedContact?._id === conv.otherUser._id 
                                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-100' 
                                        : 'hover:bg-white hover:shadow-sm text-slate-600'}
                                `}
                            >
                                <div className="relative shrink-0">
                                    <img
                                        src={conv.otherUser.profileImage ? (conv.otherUser.profileImage.startsWith('data:') ? conv.otherUser.profileImage : `/${conv.otherUser.profileImage.replace(/\\/g, '/')}`) : `https://ui-avatars.com/api/?name=${conv.otherUser.name}&background=random`}
                                        alt={conv.otherUser.name}
                                        className="w-10 h-10 rounded-2xl border-2 border-white shadow-sm object-cover"
                                    />
                                    {conv.unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h4 className={`text-[11px] font-black truncate capitalize ${selectedContact?._id === conv.otherUser._id ? 'text-white' : 'text-slate-900'}`}>
                                            {conv.otherUser.name}
                                        </h4>
                                        <span className={`text-[8px] font-bold opacity-60`}>
                                            {formatTime(conv.lastMessage.createdAt)}
                                        </span>
                                    </div>
                                    <p className={`text-[10px] truncate font-medium opacity-80`}>
                                        {conv.lastMessage.content}
                                    </p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="py-20 text-center space-y-4">
                            <MessageSquare size={32} className="mx-auto text-slate-200" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Client Activity</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Chat Area */}
            <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
                {selectedContact ? (
                    <>
                        <header className="h-24 px-10 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-10">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setIsMobileListOpen(true)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><ChevronLeft size={20} /></button>
                                <div className="w-12 h-12 rounded-[20px] bg-slate-50 border-2 border-white shadow-lg overflow-hidden">
                                    <img 
                                        src={selectedContact.profileImage ? (selectedContact.profileImage.startsWith('data:') ? selectedContact.profileImage : `/${selectedContact.profileImage.replace(/\\/g, '/')}`) : `https://ui-avatars.com/api/?name=${selectedContact.name}&background=random`} 
                                        className="w-full h-full object-cover" 
                                        alt="Client" 
                                    />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-black text-slate-900 tracking-tight lowercase first-letter:uppercase">{selectedContact.name}</h3>
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Encrypted Line Active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all">
                                    <MoreVertical size={18} />
                                </button>
                                <AnimatePresence>
                                    {isMoreMenuOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="absolute right-10 top-20 w-56 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2 z-30"
                                        >
                                            <button className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl flex items-center gap-3 transition-all">
                                                <User size={14} /> Mission Portfolio
                                            </button>
                                            <button className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl flex items-center gap-3 transition-all">
                                                <ShieldCheck size={14} /> Verify Security
                                            </button>
                                            <div className="h-px bg-slate-50 my-1 mx-2" />
                                            <button className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl flex items-center gap-3 transition-all">
                                                <X size={14} /> Close Comms
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.03),transparent)]">
                            {loadingThread ? (
                                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-500" /></div>
                            ) : (
                                thread.map((msg, i) => {
                                    const senderId = msg.sender?._id || msg.sender;
                                    const isMe = senderId && currentUserId && String(senderId) === String(currentUserId);
                                    return (
                                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                            <div className={`max-w-[80%] flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {isMe ? (
                                                    <div className="w-6 h-6 rounded-lg overflow-hidden border border-slate-200 shrink-0 mb-1">
                                                        {localStorage.getItem('userProfileImage') ? (
                                                            <OptimizedImage 
                                                                src={localStorage.getItem('userProfileImage')} 
                                                                className="w-full h-full" 
                                                                alt="Me" 
                                                                fallbackIcon={User}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-[10px] font-black">{localStorage.getItem('userName')?.charAt(0)}</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-100 overflow-hidden flex items-center justify-center shrink-0 mb-1">
                                                        {selectedContact.profileImage ? (
                                                            <OptimizedImage 
                                                                src={selectedContact.profileImage} 
                                                                className="w-full h-full" 
                                                                alt={selectedContact.name} 
                                                                fallbackIcon={User}
                                                            />
                                                        ) : (
                                                            <User size={12} className="text-teal-600" />
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <div className={`
                                                        px-5 py-3.5 rounded-[24px] shadow-sm relative text-xs font-semibold leading-relaxed
                                                        ${isMe 
                                                            ? 'bg-slate-900 text-white rounded-tr-none' 
                                                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}
                                                    `}>
                                                        {msg.attachments?.length > 0 && (
                                                            <div className="mb-3 space-y-2">
                                                                {msg.attachments.map((att, idx) => {
                                                                    const apiBaseUrl = 'http://localhost:5001';
                                                                    const fileUrl = att.url.startsWith('http') 
                                                                        ? att.url 
                                                                        : att.url.startsWith('/') 
                                                                            ? `${apiBaseUrl}${att.url}` 
                                                                            : `${apiBaseUrl}/${att.url.replace(/\\/g, '/')}`;
                                                                    
                                                                    return (
                                                                    <a 
                                                                        key={idx}
                                                                        href={fileUrl} 
                                                                        download={att.filename}
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className={`flex items-center gap-3 p-3 rounded-2xl border no-underline transition-all ${isMe ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-slate-50 border-slate-100 hover:bg-white'} `}
                                                                    >
                                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isMe ? 'bg-teal-500' : 'bg-white border border-slate-50'} shadow-sm`}>
                                                                            <FileText size={14} className={isMe ? 'text-white' : 'text-teal-600'} />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0 pr-2">
                                                                            <p className={`text-[9px] font-black truncate uppercase tracking-widest ${isMe ? 'text-teal-200' : 'text-slate-900'}`}>{att.filename}</p>
                                                                            <p className={`text-[8px] opacity-60`}>{(att.fileSize / 1024 / 1024).toFixed(1)}MB</p>
                                                                        </div>
                                                                        <Download size={14} className="opacity-40" />
                                                                    </a>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                    <div className={`mt-2 flex items-center gap-1.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{formatTime(msg.createdAt)}</span>
                                                        {isMe && (msg.isRead ? <CheckCheck size={10} className="text-teal-500" /> : <Check size={10} className="text-slate-300" />)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-8 bg-white border-t border-slate-50 pb-10">
                            <form 
                                onSubmit={handleSendMessage}
                                className="flex items-center gap-4 bg-slate-50/50 p-3 pl-6 rounded-3xl border border-slate-100 focus-within:ring-4 focus-within:ring-teal-500/5 focus-within:bg-white focus-within:border-teal-100 transition-all duration-300"
                            >
                                <input type="file" ref={fileInputRef} className="hidden" onChange={onFileChange} />
                                <button type="button" onClick={handleFileSelect} className="p-2 text-slate-400 hover:text-teal-600 transition-all active:scale-90"><Paperclip size={20} /></button>
                                <input
                                    type="text"
                                    placeholder="Execute response mission..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                    className="flex-1 bg-transparent border-none py-3 text-xs font-bold text-slate-800 focus:ring-0 outline-none placeholder:text-slate-300 placeholder:italic"
                                />
                                <div className="flex items-center gap-1 pr-1">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                                        className="p-2.5 text-slate-400 hover:text-teal-600 transition-all hidden sm:block active:scale-90"
                                    >
                                        <Smile size={20} />
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-teal-600 disabled:bg-slate-200 transition-all active:scale-95 flex items-center justify-center"
                                    >
                                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    </button>
                                </div>

                                {isEmojiPickerOpen && (
                                    <div className="absolute bottom-28 right-12 bg-white shadow-2xl border border-slate-100 p-6 rounded-[32px] z-20 grid grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-5">
                                        {['🤝', '🛠️', '✅', '✨', '🚀', '📞', '📍', '💰'].map(emoji => (
                                            <button key={emoji} type="button" onClick={() => { setNewMessage(prev => prev + emoji); setIsEmojiPickerOpen(false); }} className="text-xl hover:scale-125 transition-transform">{emoji}</button>
                                        ))}
                                    </div>
                                )}
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.02),transparent)]">
                        <div className="w-32 h-32 bg-teal-50/50 rounded-[48px] flex items-center justify-center mb-8 border border-white shadow-xl relative group">
                            <div className="absolute inset-0 bg-teal-500/10 rounded-[48px] animate-pulse group-hover:animate-none scale-110" />
                            <MessageSquare size={48} className="text-teal-600 relative z-10 opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Check the customers</h2>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium text-sm leading-relaxed">
                            Awaiting incoming client signals. Select a secure line from the command center to begin encrypted communication.
                        </p>
                        <button 
                            onClick={() => setIsComposeOpen(true)}
                            className="mt-12 px-10 py-4 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-teal-600 transition-all active:scale-[0.98] flex items-center gap-3"
                        >
                            <Plus size={16} /> New Chat
                        </button>
                    </div>
                )}
            </main>

            {/* Outreach Compose Modal */}
            <AnimatePresence>
                {isComposeOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 p-10"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Direct Outreach</h3>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Establish Primary Communications</p>
                                </div>
                                <button onClick={() => setIsComposeOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleComposeNew} className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Channel Email</label>
                                    <input
                                        type="email"
                                        placeholder="client@mission.com"
                                        value={composeData.to}
                                        onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                                        className="w-full px-7 py-5 bg-slate-50 border-none rounded-[24px] text-xs font-black shadow-inner focus:ring-4 focus:ring-teal-500/5 outline-none transition-all placeholder:text-slate-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Broadcast Data</label>
                                    <textarea
                                        placeholder="Transmit your message here..."
                                        rows={4}
                                        value={composeData.content}
                                        onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                                        className="w-full px-7 py-5 bg-slate-50 border-none rounded-[24px] text-xs font-bold shadow-inner focus:ring-4 focus:ring-teal-500/5 outline-none transition-all resize-none placeholder:text-slate-300"
                                        required
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsComposeOpen(false)} className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-[24px] transition-all">Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="flex-[2] py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-[24px] shadow-2xl hover:bg-teal-600 disabled:bg-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        Establish Link
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfessionalMessages;
