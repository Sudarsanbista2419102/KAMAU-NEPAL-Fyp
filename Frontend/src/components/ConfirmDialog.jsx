import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, CheckCircle, Info, X } from 'lucide-react';
import { useTranslation } from '../utils/LanguageContext';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  cancelText,
  type = "danger" // danger, success, info
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const displayConfirm = confirmText || t('confirm');
  const displayCancel = cancelText || t('cancel');

  const themes = {
    danger: {
      icon: <LogOut className="w-6 h-6 text-rose-500" />,
      bg: "bg-rose-50",
      border: "border-rose-100",
      button: "bg-rose-500 hover:bg-rose-600 shadow-rose-100"
    },
    success: {
      icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      button: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100"
    },
    info: {
      icon: <Info className="w-6 h-6 text-teal-500" />,
      bg: "bg-teal-50",
      border: "border-teal-100",
      button: "bg-teal-500 hover:bg-teal-600 shadow-teal-100"
    }
  };

  const currentTheme = themes[type] || themes.info;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          {/* Dialog Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className={`${currentTheme.bg} ${currentTheme.border} border p-4 rounded-2xl mb-6 shadow-sm`}>
                  {currentTheme.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button 
                  onClick={() => {
                    if (typeof onConfirm === 'function') {
                      onConfirm();
                    }
                    onClose();
                  }}
                  className={`w-full py-4 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] ${currentTheme.button}`}
                >
                  {displayConfirm}
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all"
                >
                  {displayCancel}
                </button>
              </div>
            </div>

            {/* Close icon button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
