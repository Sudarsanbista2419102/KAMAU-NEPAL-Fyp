import React from 'react';
import RequestCard from './RequestCard';
import { Bell } from 'lucide-react';
import { useTranslation } from '../../utils/LanguageContext';

const RequestsList = ({ requests, onAction, onDownloadPDF, loading, error, title }) => {
  const { t } = useTranslation();
  const displayTitle = title || t('active_requests');
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{t('scanning_database')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 p-12 rounded-3xl border border-rose-100 text-center animate-in fade-in zoom-in duration-300">
        <p className="text-rose-600 font-bold">Failed to load service requests.</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-xs font-black uppercase tracking-widest text-rose-500 hover:underline">Re-initialize Link</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{displayTitle}</h3>
        <div className="px-3 py-1 bg-teal-50 text-teal-600 rounded-lg text-[10px] font-black border border-teal-100 uppercase tracking-wider">
          {requests.length} {t('results')}
        </div>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {requests.length > 0 ? (
          requests.map((req) => (
            <RequestCard key={req._id} request={req} onAction={onAction} onDownloadPDF={onDownloadPDF} />
          ))
        ) : (
          <div className="bg-white p-20 rounded-[40px] border border-slate-100 text-center shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-300 group-hover:scale-110 transition-transform duration-500">
                <Bell size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{t('no_requests_title')}</h3>
              <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto">{t('no_requests_desc')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsList;
