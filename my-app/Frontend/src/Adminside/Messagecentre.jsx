import React, { useState } from 'react';
import { Send, MessageSquare, Users, UserCheck, Zap, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { broadcastNotification } from './adminService';

const MessageCenter = () => {
  const [recipient, setRecipient] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // { success, text }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setResult(null);
    try {
      const res = await broadcastNotification({ 
        recipient, 
        title: title.trim(), 
        message: message.trim() 
      });
      setResult({ success: true, text: `Broadcast successfully transmitted to ${res.count} recipient(s)` });
      setTitle('');
      setMessage('');
    } catch (err) {
      setResult({ success: false, text: err.message || 'Failed to broadcast notification' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 h-full flex flex-col space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-100">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Broadcast Center</h2>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Global Announcement Engine</p>
          </div>
        </div>
        
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start gap-4">
          <Info size={16} className="text-teal-600 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Announcements sent through this center will appear immediately in the notification bells of all targeted users and professionals.
          </p>
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="flex-1 flex flex-col space-y-5">
        {/* Recipient Selector */}
        <div className="space-y-3">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-2">Target Audience</label>
          <div className="grid grid-cols-3 gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
            {[
              { id: 'all', label: 'All Platform', icon: Zap, color: 'text-orange-500', activeBg: 'bg-orange-500' },
              { id: 'professionals', label: 'Pros Only', icon: UserCheck, color: 'text-teal-600', activeBg: 'bg-teal-600' },
              { id: 'users', label: 'Users Only', icon: Users, color: 'text-emerald-600', activeBg: 'bg-emerald-600' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setRecipient(type.id)}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-semibold uppercase tracking-wider transition-all ${
                  recipient === type.id
                    ? `${type.activeBg} text-white shadow-lg scale-102`
                    : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100 hover:border-slate-200 shadow-sm'
                }`}
              >
                <type.icon size={14} />
                <span className="hidden sm:inline">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-3">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-2">Announcement Heading</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Scheduled System Maintenance"
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all placeholder:text-slate-300 text-slate-900 shadow-inner"
          />
        </div>

        {/* Message Textarea */}
        <div className="space-y-3 flex-1 flex flex-col">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-2">Message Body</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Provide specific details about the announcement..."
            className="w-full flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs font-medium focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all placeholder:text-slate-300 resize-none text-slate-700 shadow-inner leading-relaxed"
          />
        </div>

        {/* Result feedback */}
        {result && (
          <div className={`p-4 rounded-2xl animate-in slide-in-from-bottom-2 duration-300 flex items-center gap-3 ${
            result.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${result.success ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
              {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider">{result.success ? 'Success' : 'Transmission Failed'}</p>
              <p className="text-[11px] font-semibold opacity-85 mt-0.5">{result.text}</p>
            </div>
          </div>
        )}

        {/* Send Button */}
        <button
          type="submit"
          disabled={sending || !title.trim() || !message.trim()}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-[9px] uppercase tracking-wider transition-all shadow-lg ${
            sending || !title.trim() || !message.trim()
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-teal-100 hover:shadow-teal-200 hover:-translate-y-0.5 active:scale-95 active:translate-y-0'
          }`}
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send size={14} />
              Commit Broadcast
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageCenter;