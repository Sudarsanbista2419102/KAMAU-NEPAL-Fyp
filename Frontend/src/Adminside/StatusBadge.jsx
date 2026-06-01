import React from 'react';
import { CheckCircle2, Clock, XCircle, Shield, Zap } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-orange-50 text-orange-600 border-orange-100',
      icon: <Clock className="w-3.5 h-3.5" />,
      label: 'Pending'
    },
    verified: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      icon: <Shield className="w-3.5 h-3.5" />,
      label: 'Verified'
    },
    approved: {
      bg: 'bg-teal-50 text-teal-600 border-teal-100',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: 'Approved'
    },
    rejected: {
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
      icon: <XCircle className="w-3.5 h-3.5" />,
      label: 'Rejected'
    },
    active: {
      bg: 'bg-sky-50 text-sky-600 border-sky-100',
      icon: <Zap className="w-3.5 h-3.5" />,
      label: 'Active'
    }
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${config.bg}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;

