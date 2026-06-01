import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageSquare,
    Send,
    Archive,
    Star,
    Search,
    Plus,
    MoreVertical,
    ChevronLeft,
    X,
    // Phone, // Unused - can be added when call feature is implemented
    // Video, // Unused - can be added when call feature is implemented
    Smile,
    Paperclip,
    Check,
    CheckCheck,
    AlertTriangle,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
    getConversations, 
    getMessageThread, 
    sendMessage, 
    uploadAttachment
} from '../services/messageService';
import { FileText, Download } from 'lucide-react';
import axios from 'axios';
import OptimizedImage from '../components/OptimizedImage';

export default function MessagePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const messagesEndRef = useRef(null);
    
    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobileListOpen, setIsMobileListOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const fileInputRef = useRef(null);
    
    // Data State
    const [conversations, setConversations] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [thread, setThread] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingThread, setLoadingThread] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [composeData, setComposeData] = useState({ to: '', subject: 'Inquiry', content: '' });

    const [confirmDialog, setConfirmDialog] = useState({ 
        isOpen: false, 
        title: '', 
        message: '', 
        onConfirm: () => {}, 
        type: 'danger' 
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [isReporting, setIsReporting] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);

    const handleOpenReportModal = async () => {
        setIsMoreMenuOpen(false);
        const role = localStorage.getItem('role');
        if (role === 'user' && selectedContact) {
            try {
                const { checkUserBookingStatus } = await import('../bookingService');
                const res = await checkUserBookingStatus(currentUserId, selectedContact._id);
                if (!res.hasCompletedBooking) {
                    alert('You can only report a professional after a service has been completed.');
                    return;
                }
            } catch (err) {
                console.error("Error checking report eligibility:", err);
                // Fallback to allowing modal but backend will still catch it
            }
        }
        setIsReportModalOpen(true);
    };

    const handleReportUser = async (e) => {
        e.preventDefault();
        if (!reportReason || !reportDescription || !selectedContact) return;

        setIsReporting(true);
        try {
            const role = localStorage.getItem('role'); // 'user' or 'professional'
            const reporterModel = role === 'professional' ? 'Professional' : 'User';
            const targetModel = role === 'professional' ? 'User' : 'Professional';

            await axios.post('/api/reports', {
                reporter: currentUserId,
                reporterModel,
                target: selectedContact._id,
                targetModel,
                reason: reportReason,
                description: reportDescription
            });

            setReportSuccess(true);
            setTimeout(() => {
                setIsReportModalOpen(false);
                setReportSuccess(false);
                setReportReason('');
                setReportDescription('');
            }, 3000);
        } catch (error) {
            console.error('Report submission error:', error);
            const msg = error.response?.data?.message || 'Failed to submit report. Please try again.';
            alert(msg);
        } finally {
            setIsReporting(false);
        }
    };

    const currentUserId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || 'User';
    const userProfileImage = localStorage.getItem('userProfileImage');

    const fetchConversations = useCallback(async () => {
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
    }, []);

    const fetchThread = useCallback(async (userId) => {
        try {
            setLoadingThread(true);
            const response = await getMessageThread(userId);
            if (response.success) {
                setThread(response.data);
                // After opening thread, refresh conversations to update unread badges
                fetchConversations();
                // Trigger global count refresh
                window.dispatchEvent(new Event('refreshUnreadCount'));
            }
        } catch (error) {
            console.error('Error fetching thread:', error);
        } finally {
            setLoadingThread(false);
        }
    }, [fetchConversations]);

    useEffect(() => {
        fetchConversations();
        
        // Handle incoming compose state from ProfessionalProfile or Booking
        if (location.state?.composeTo) {
            const initialUserId = location.state.composeTo;
            // If they are already in our contacts, select them
            // Otherwise, we might need to show a blank thread or handle compose
            setLoadingThread(true);
            setSelectedContact({
                _id: initialUserId,
                name: location.state.recipientName || 'Professional',
                profileImage: location.state.recipientImage || null,
                email: location.state.recipientEmail || ''
            });
            fetchThread(initialUserId);
            setIsMobileListOpen(false);
            // Clear state
            window.history.replaceState({}, document.title);
        }
    }, [location.state, fetchConversations, fetchThread]);

    useEffect(() => {
        scrollToBottom();
    }, [thread]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSelectConversation = (conv) => {
        setSelectedContact(conv.otherUser);
        fetchThread(conv.otherUser._id);
        setIsMobileListOpen(false);
        setIsMoreMenuOpen(false);
    };

    const handleCall = (type) => {
        alert(`${type === 'video' ? 'Video' : 'Voice'} call with ${selectedContact.name} is not implemented in this demo.`);
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedContact) return;

        try {
            setSending(true);
            const uploadRes = await uploadAttachment(file);
            
            if (uploadRes.success) {
                const attachment = uploadRes.data;
                // Send a message with this attachment
                const response = await sendMessage({
                    receiverId: selectedContact._id,
                    subject: 'Sent an attachment',
                    content: `Attached: ${attachment.filename}`,
                    attachments: [attachment]
                });

                if (response.success) {
                    // Update local thread
                    const tempMsg = {
                        _id: Date.now().toString(),
                        sender: { _id: currentUserId, name: userName },
                        receiver: { _id: selectedContact._id },
                        content: `Attached: ${attachment.filename}`,
                        attachments: [attachment],
                        createdAt: new Date().toISOString(),
                        isRead: false
                    };
                    setThread([...thread, tempMsg]);
                    fetchConversations();
                }
            }
        } catch (error) {
            console.error('File upload failed:', error);
            alert('Failed to upload file');
        } finally {
            setSending(false);
            // reset file input
            if (e.target) e.target.value = '';
        }
    };

    const handleDeleteConversation = async () => {
        if (!selectedContact) return;
        
        setConfirmDialog({
            isOpen: true,
            title: "Delete Conversation",
            message: `Are you sure you want to delete all messages with ${selectedContact.name}? This cannot be undone.`,
            type: 'danger',
            onConfirm: async () => {
                // In a real app, we'd have a handleDeleteConversation endpoint
                // For now, we'll just clear it locally and show a toast
                alert("Conversation deleted (simulated).");
                setSelectedContact(null);
                fetchConversations();
            }
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        setSending(true);
        try {
            const response = await sendMessage({
                receiverId: selectedContact._id,
                subject: 'Chat Message',
                content: newMessage
            });

            if (response.success) {
                // Add to local thread immediately for snappy feel
                const tempMsg = {
                    _id: Date.now().toString(),
                    sender: { _id: currentUserId, name: userName },
                    receiver: { _id: selectedContact._id },
                    content: newMessage,
                    createdAt: new Date().toISOString(),
                    isRead: false
                };
                setThread([...thread, tempMsg]);
                setNewMessage('');
                fetchConversations(); // Update list order
                // Trigger global count refresh
                window.dispatchEvent(new Event('refreshUnreadCount'));
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleComposeNew = async (e) => {
        e.preventDefault();
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

            if (!targetId) throw new Error('Recipient not found');

            const response = await sendMessage({
                receiverId: targetId,
                subject: composeData.subject || 'New Inquiry',
                content: composeData.content
            });

            if (response.success) {
                setIsComposeOpen(false);
                setComposeData({ to: '', subject: 'Inquiry', content: '' });
                fetchConversations();
                // Optionally open the thread
                const contactRes = await axios.get(`/api/users/${targetId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (contactRes.data?.success) {
                    setSelectedContact(contactRes.data.data);
                    fetchThread(targetId);
                    setIsMobileListOpen(false);
                }
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setSending(false);
        }
    };

    const handleLogout = () => {
        setConfirmDialog({
            isOpen: true,
            title: "Sign Out",
            message: "Are you sure you want to log out?",
            type: 'danger',
            onConfirm: () => {
                localStorage.clear();
                navigate('/');
            }
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const filteredConversations = conversations.filter(conv => 
        conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                handleLogout={handleLogout}
            />

            <div className="flex-1 flex overflow-hidden relative">
                {/* Conversation List Sidebar */}
                <aside className={`
                    absolute lg:relative z-10 w-full lg:w-96 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300
                    ${isMobileListOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="p-6 border-b border-gray-100 italic">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
                            <button 
                                onClick={() => setIsComposeOpen(true)}
                                className="p-2 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loadingConversations ? (
                            <div className="p-8 space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="flex gap-3 animate-pulse">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                                            <div className="h-3 bg-gray-100 rounded w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredConversations.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {filteredConversations.map((conv) => (
                                    <button
                                        key={conv.otherUser._id}
                                        onClick={() => handleSelectConversation(conv)}
                                        className={`w-full flex items-center gap-4 p-4 hover:bg-orange-50/50 transition-all text-left ${selectedContact?._id === conv.otherUser._id ? 'bg-orange-50 border-l-4 border-orange-500' : 'border-l-4 border-transparent'}`}
                                    >
                                        <div className="relative shrink-0">
                                            <img
                                                src={conv.otherUser.profileImage ? (conv.otherUser.profileImage.startsWith('data:') ? conv.otherUser.profileImage : `/${conv.otherUser.profileImage.replace(/\\/g, '/')}`) : `https://ui-avatars.com/api/?name=${conv.otherUser.name}&background=random`}
                                                alt={conv.otherUser.name}
                                                className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                                            />
                                            {conv.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                                    {conv.otherUser.name}
                                                </h3>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {formatTime(conv.lastMessage.createdAt)}
                                                </span>
                                            </div>
                                            <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                                {conv.lastMessage.content}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
                                <p>No conversations found</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Chat Window */}
                <main className="flex-1 flex flex-col bg-white overflow-hidden">
                    {selectedContact ? (
                        <>
                            {/* Chat Header */}
                            <header className="h-20 px-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setIsMobileListOpen(true)}
                                        className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div className="relative">
                                        <img
                                            src={selectedContact.profileImage ? (selectedContact.profileImage.startsWith('data:') ? selectedContact.profileImage : `/${selectedContact.profileImage.replace(/\\/g, '/')}`) : `https://ui-avatars.com/api/?name=${selectedContact.name}&background=random`}
                                            alt={selectedContact.name}
                                            className="w-10 h-10 rounded-full shadow-sm"
                                        />
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-800 text-lg">{selectedContact.name}</h2>
                                        <p className="text-xs text-green-500 font-medium">Online</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 relative">
                                    <button 
                                        onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                                        className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    <AnimatePresence>
                                        {isMoreMenuOpen && (
                                            <>
                                                <div 
                                                    className="fixed inset-0 z-20" 
                                                    onClick={() => setIsMoreMenuOpen(false)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-30"
                                                >
                                                    <button 
                                                        onClick={() => {
                                                            navigate(`/professional/${selectedContact._id}`);
                                                            setIsMoreMenuOpen(false);
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-3"
                                                    >
                                                        <Search size={16} /> View Profile
                                                    </button>
                                                    <button 
                                                        onClick={handleOpenReportModal}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                                    >
                                                        <AlertTriangle size={16} /> Report User
                                                    </button>
                                                    <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-3">
                                                        <Star size={16} /> Star Conversation
                                                    </button>
                                                    <div className="h-px bg-gray-50 my-1" />
                                                    <button 
                                                        onClick={() => {
                                                            handleDeleteConversation();
                                                            setIsMoreMenuOpen(false);
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3"
                                                    >
                                                        <Archive size={16} /> Delete Conversation
                                                    </button>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </header>

                            {/* Messages Thread */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                                {loadingThread ? (
                                    <div className="flex justify-center py-10">
                                        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <>
                                        {thread.map((msg, index) => {
                                            const isMe = msg.sender._id === currentUserId;
                                            return (
                                                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[75%] lg:max-w-[60%] flex gap-3 items-end ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        {isMe ? (
                                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0 mb-1">
                                                                {userProfileImage ? (
                                                                    <OptimizedImage 
                                                                        src={userProfileImage} 
                                                                        className="w-full h-full" 
                                                                        alt="Me" 
                                                                        fallbackIcon={User}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-xs font-bold">{userName?.charAt(0)}</div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0 mb-1">
                                                                {selectedContact.profileImage ? (
                                                                    <OptimizedImage 
                                                                        src={selectedContact.profileImage} 
                                                                        className="w-full h-full" 
                                                                        alt={selectedContact.name} 
                                                                        fallbackIcon={User}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-600 text-xs font-bold">{selectedContact.name?.charAt(0)}</div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                            <div className={`
                                                                px-4 py-3 rounded-2xl shadow-sm relative
                                                                ${isMe 
                                                                    ? 'bg-orange-600 text-white rounded-tr-none' 
                                                                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}
                                                            `}>
                                                                {msg.attachments?.length > 0 && (
                                                                    <div className="mb-3 space-y-3">
                                                                        {msg.attachments.map((att, i) => {
                                                                            const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(att.filename) || att.mimetype?.startsWith('image/');
                                                                            const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
                                                                            const fileUrl = att.url.startsWith('http') 
                                                                                ? att.url 
                                                                                : att.url.startsWith('/') 
                                                                                    ? `${apiBaseUrl}${att.url}` 
                                                                                    : `${apiBaseUrl}/${att.url.replace(/\\/g, '/')}`;

                                                                            if (isImage) {
                                                                                return (
                                                                                    <div 
                                                                                        key={i} 
                                                                                        className="relative group overflow-hidden rounded-2xl border border-gray-100 shadow-sm cursor-pointer"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setPreviewImage({ url: fileUrl, name: att.filename });
                                                                                        }}
                                                                                    >
                                                                                        <img 
                                                                                            src={fileUrl} 
                                                                                            alt={att.filename} 
                                                                                            className="w-full h-auto max-h-64 object-cover group-hover:opacity-90 transition-opacity" 
                                                                                            draggable={false}
                                                                                        />
                                                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center pointer-events-none">
                                                                                            <div className="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold text-sm opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg">
                                                                                                View Image
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            }

                                                                            return (
                                                                                <a 
                                                                                    key={i}
                                                                                    href={fileUrl} 
                                                                                    download={att.filename}
                                                                                    target="_blank" 
                                                                                    rel="noopener noreferrer"
                                                                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isMe ? 'bg-orange-700/50 border-orange-500/50 hover:bg-orange-700' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'} no-underline`}
                                                                                >
                                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMe ? 'bg-orange-500' : 'bg-white shadow-sm'}`}>
                                                                                        <FileText size={20} className={isMe ? 'text-white' : 'text-orange-600'} />
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0 pr-4">
                                                                                        <p className={`text-xs font-bold truncate ${isMe ? 'text-white' : 'text-gray-900'}`}>{att.filename}</p>
                                                                                        <p className={`text-[10px] ${isMe ? 'text-orange-200' : 'text-gray-400'}`}>{(att.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                                                                    </div>
                                                                                    <Download size={16} className={isMe ? 'text-orange-200' : 'text-gray-400'} />
                                                                                </a>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                                <div className={`mt-1 flex items-center gap-1.5 ${isMe ? 'justify-end text-orange-200' : 'justify-start text-gray-400'}`}>
                                                                    <span className="text-[10px] font-medium">{formatTime(msg.createdAt)}</span>
                                                                    {isMe && (
                                                                        msg.isRead ? <CheckCheck size={12} /> : <Check size={12} />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-white">
                                <form 
                                    onSubmit={handleSendMessage}
                                    className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/20 transition-all"
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={onFileChange}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleFileSelect}
                                        className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                                    >
                                        <Paperclip size={20} />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        className="flex-1 bg-transparent border-none py-2 text-sm focus:ring-0 outline-none"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                                        className="p-2 text-gray-400 hover:text-orange-600 transition-colors hidden sm:block"
                                    >
                                        <Smile size={20} />
                                    </button>
                                    {isEmojiPickerOpen && (
                                        <div className="absolute bottom-24 right-24 bg-white shadow-2xl border border-gray-100 p-4 rounded-3xl z-30 animate-in fade-in slide-in-from-bottom-5">
                                            <div className="grid grid-cols-4 gap-2">
                                                {['😊', '😂', '🔥', '👍', '🙏', '💯', '👋', '❤️'].map(emoji => (
                                                    <button 
                                                        key={emoji}
                                                        type="button"
                                                        onClick={() => {
                                                            setNewMessage(prev => prev + emoji);
                                                            setIsEmojiPickerOpen(false);
                                                        }}
                                                        className="text-2xl hover:scale-125 transition-transform"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <button 
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="p-2.5 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-100 hover:bg-orange-700 disabled:bg-gray-300 disabled:shadow-none transition-all active:scale-95"
                                    >
                                        {sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                                <MessageSquare size={48} className="text-orange-600 opacity-40" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Your Conversations</h2>
                            <p className="text-gray-500 max-w-xs mx-auto">
                                Select a chat from the sidebar to start messaging or create a new conversation.
                            </p>
                            <button 
                                onClick={() => setIsComposeOpen(true)}
                                className="mt-8 px-8 py-3 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Start New Chat
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* Compose Modal */}
            <AnimatePresence>
                {isComposeOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 pb-4 flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-gray-800">New Message</h3>
                                <button
                                    onClick={() => setIsComposeOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleComposeNew} className="p-8 pt-4 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Recipient Email</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. professional@example.com"
                                        value={composeData.to}
                                        onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Message Content</label>
                                    <textarea
                                        placeholder="Write your message here..."
                                        rows={5}
                                        value={composeData.content}
                                        onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                                        required
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsComposeOpen(false)}
                                        className="flex-1 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="flex-[2] py-4 bg-orange-600 text-white text-sm font-bold rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-700 disabled:bg-gray-300 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                                        {sending ? 'Sending...' : 'Send Message'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {previewImage && (
                    <div 
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                        onClick={() => setPreviewImage(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-5xl w-full flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setPreviewImage(null)}
                                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                            >
                                <X size={32} />
                            </button>
                            <img 
                                src={previewImage.url} 
                                alt={previewImage.name} 
                                className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl"
                                draggable={false}
                            />
                            <p className="mt-6 text-white font-medium text-lg">{previewImage.name}</p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Report Modal */}
            <AnimatePresence>
                {isReportModalOpen && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsReportModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden z-10"
                        >
                            {reportSuccess ? (
                                <div className="p-12 text-center">
                                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                                        <Check size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Report Submitted</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        Thank you for your report. Our team will review the conversation and take appropriate action.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleReportUser} className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Report User</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Help us maintain a safe community</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setIsReportModalOpen(false)}
                                            className="p-2 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reason for Report</label>
                                            <select 
                                                required
                                                value={reportReason}
                                                onChange={(e) => setReportReason(e.target.value)}
                                                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                                            >
                                                <option value="">Select a reason</option>
                                                <option value="Inappropriate Behavior">Inappropriate Behavior</option>
                                                <option value="Late arrival">Late Arrival</option>
                                                <option value="Poor service">Poor Service</option>
                                                <option value="Overcharging">Overcharging</option>
                                                <option value="Fraud/scam">Fraud/Scam</option>
                                                <option value="Harassment">Harassment</option>
                                                <option value="Payment Issues">Payment Issues</option>
                                                <option value="Safety Concerns">Safety Concerns</option>
                                                <option value="Fake Booking">Fake Booking</option>
                                                <option value="No Show">No Show</option>
                                                <option value="Unreasonable Demands">Unreasonable Demands</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Details</label>
                                            <textarea 
                                                required
                                                rows="4"
                                                value={reportDescription}
                                                onChange={(e) => setReportDescription(e.target.value)}
                                                placeholder="Please provide more context about the issue..."
                                                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-medium focus:ring-2 focus:ring-rose-500 transition-all outline-none resize-none"
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button 
                                                type="submit"
                                                disabled={isReporting}
                                                className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isReporting ? 'Submitting...' : 'Submit Report'}
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setIsReportModalOpen(false)}
                                                className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmDialog 
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                type={confirmDialog.type}
            />
        </div>
    );
}
