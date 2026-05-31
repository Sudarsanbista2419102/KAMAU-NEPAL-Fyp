import React, { useState } from 'react';
import { MapPin, Calendar, Clock, CheckCircle, XCircle, User, Mail, Phone, X, FileText, UserCircle, MessageSquare } from 'lucide-react';
import OptimizedImage from '../../components/OptimizedImage';

const RequestCard = ({ request, onAction, onDownloadPDF }) => {
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [messageSending, setMessageSending] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleAction = async (status, notes = "") => {
    setLoading(true);
    await onAction(request._id, status, notes);
    setLoading(false);
    setShowRejectionModal(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim() || !request.userId?._id) return;

    setMessageSending(true);
    try {
      const { sendMessage } = await import('../../services/messageService');
      const response = await sendMessage({
        receiverId: request.userId._id,
        subject: `Regarding: ${request.serviceTitle}`,
        content: messageContent
      });

      if (response.success) {
        setMessageContent('');
        setShowMessageModal(false);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setMessageSending(false);
    }
  };

  const statusColors = {
    Pending: 'bg-orange-100 text-orange-700 border-orange-200',
    Confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Rejected: 'bg-rose-100 text-rose-700 border-rose-200',
    Completed: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <>
      <div className="bg-white w-full p-6 rounded-3xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all group overflow-hidden relative">
        {!request.read && request.status === 'Pending' && (
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 -mr-12 -mt-12 rounded-full blur-2xl"></div>
        )}
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <button 
              onClick={() => setShowProfile(true)}
              className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl font-bold text-teal-600 border border-slate-100 overflow-hidden flex-shrink-0 shadow-inner hover:scale-105 transition-transform"
            >
              {request.userId?.profileImage ? (
                <OptimizedImage 
                  src={request.userId.profileImage} 
                  className="w-full h-full" 
                  alt={request.fullName}
                  fallbackIcon={UserCircle}
                />
              ) : (
                request.fullName?.charAt(0) || <User size={24} />
              )}
            </button>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowProfile(true)}
                  className="font-black text-slate-900 hover:text-teal-600 transition-colors truncate text-lg text-left"
                >
                  {request.fullName}
                </button>
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusColors[request.status] || 'bg-slate-100 text-slate-600'}`}>
                  {request.status === 'Confirmed' ? 'Ongoing' : request.status}
                </div>
              </div>
              <p className="text-sm font-bold text-teal-600">{request.serviceTitle}</p>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed max-w-md">{request.workDescription}</p>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  <MapPin size={12} className="text-teal-500" />
                  {request.location}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  <Calendar size={12} className="text-orange-500" />
                  {new Date(request.bookingDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  <Clock size={12} className="text-blue-500" />
                  {request.timeSchedule}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-row lg:flex-col items-center lg:items-end gap-6 lg:gap-4 pl-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0">
            <div className="text-left lg:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Service Fee</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{request.totalCost}</p>
            </div>
            
            <div className="flex items-center gap-2 ml-auto lg:ml-0">
              {request.status === 'Pending' && (
                <>
                  <button 
                    disabled={loading}
                    onClick={() => handleAction('Confirmed')}
                    className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg shadow-teal-200 active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle size={14} />
                    Accept
                  </button>
                  <button 
                    disabled={loading}
                    onClick={() => setShowRejectionModal(true)}
                    className="flex items-center gap-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-100 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                </>
              )}
              {request.status === 'Confirmed' && (
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border ${statusColors[request.status]}`}>
                    <CheckCircle size={14} />
                    Ongoing
                  </div>
                  <button 
                    onClick={() => setShowMessageModal(true)}
                    title="Message Customer"
                    className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-xl transition-all active:scale-95"
                  >
                    <MessageSquare size={18} />
                  </button>
                  <button 
                    onClick={() => onDownloadPDF(request)}
                    title="Download Customer Information"
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all active:scale-95"
                  >
                    <FileText size={18} />
                  </button>
                  <button 
                    disabled={loading}
                    onClick={() => handleAction('Completed')}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle size={14} />
                    Mark Completed
                  </button>
                </div>
              )}
              {['Completed', 'Rejected', 'Cancelled'].includes(request.status) && (
                <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border ${statusColors[request.status] || 'bg-slate-100 text-slate-800'}`}>
                  {request.status === 'Completed' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {request.status}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="relative h-32 bg-gradient-to-br from-teal-500 to-teal-600">
              <button 
                onClick={() => setShowProfile(false)}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all"
              >
                <X size={20} />
              </button>
              <div className="absolute -bottom-16 left-10">
                <div className="w-32 h-32 rounded-[40px] bg-white p-1 shadow-xl">
                  <div className="w-full h-full rounded-[38px] bg-slate-50 flex items-center justify-center text-4xl font-black text-teal-600 border border-slate-100 overflow-hidden bg-white">
                    {request.userId?.profileImage ? (
                      <OptimizedImage 
                        src={request.userId.profileImage} 
                        className="w-full h-full" 
                        alt={request.fullName}
                        fallbackIcon={UserCircle}
                      />
                    ) : (
                      request.fullName?.charAt(0)
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-20 pb-10 px-10 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{request.fullName}</h3>
              <p className="text-teal-600 font-bold uppercase tracking-widest text-[10px] mb-8">Registered Client</p>

              <div className="space-y-6">
                <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-teal-200 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-teal-500 shadow-sm">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer Email</p>
                    <p className="text-sm font-black text-slate-800">{request.userId?.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-teal-200 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-orange-500 shadow-sm">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Contact</p>
                    <p className="text-sm font-black text-slate-800">{request.userId?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-teal-200 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-500 shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Client Address</p>
                    <p className="text-sm font-black text-slate-800 leading-relaxed">{request.userId?.address || request.location}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowProfile(false)}
                className="mt-10 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-teal-600 transition-all active:scale-[0.98] shadow-lg"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Rejection Reason Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Decline Request</h3>
              <button onClick={() => setShowRejectionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
              Please provide a reason for declining <span className="text-slate-900 font-bold">{request.fullName}'s</span> request. This will be sent as a notification to the customer.
            </p>

            <textarea
              placeholder="e.g., I'm fully booked this week, or the distance is too far..."
              className="w-full min-h-[120px] p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-800 font-medium resize-none mb-6"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />

            <div className="flex gap-4">
              <button 
                onClick={() => setShowRejectionModal(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                disabled={loading || !rejectionReason.trim()}
                onClick={() => handleAction('Rejected', rejectionReason)}
                className="flex-1 py-4 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-50 shadow-lg shadow-rose-100"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Message Customer</h3>
              <button onClick={() => setShowMessageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
              Send a message to <span className="text-slate-900 font-bold">{request.fullName}</span> regarding the service request.
            </p>

            <form onSubmit={handleSendMessage}>
              <textarea
                placeholder="Type your message here..."
                className="w-full min-h-[120px] p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 font-medium resize-none mb-6"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                required
              />

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={messageSending || !messageContent.trim()}
                  className="flex-1 py-4 bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {messageSending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <MessageSquare size={14} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestCard;
