import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ className = "", variant = "default" }) => {
  const navigate = useNavigate();
  
  if (variant === "simple") {
    return (
      <button 
        onClick={() => navigate(-1)}
        className={`flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold transition-colors ${className}`}
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>
    );
  }

  return (
    <button 
      onClick={() => navigate(-1)}
      className={`fixed top-6 left-6 p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-300 shadow-xl shadow-slate-200/50 group z-[60] border border-slate-100 ${className}`}
      title="Go Back"
    >
      <ArrowLeft className="text-slate-900 group-hover:-translate-x-1 transition-transform" size={20} />
    </button>
  );
};

export default BackButton;
