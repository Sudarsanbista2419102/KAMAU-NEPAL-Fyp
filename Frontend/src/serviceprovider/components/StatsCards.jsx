import React from 'react';
import { Target, Award, Zap, Activity, TrendingUp } from 'lucide-react';

const StatsCards = ({ stats }) => {
  const statItems = [
    { label: 'PENDING REQUESTS', value: stats.pendingRequests, sub: 'Waiting for approval', icon: Target, color: 'from-orange-500 to-orange-600' },
    { label: 'COMPLETED Services', value: stats.completedJobs, sub: '', icon: Award, color: 'from-teal-500 to-teal-600' },
    { label: 'TOTAL EARNINGS', value: `रू ${stats.totalEarnings.toLocaleString()}`, sub: 'Lifetime earnings', icon: Zap, color: 'from-slate-700 to-slate-800' },
    { label: 'RATING', value: stats.rating, sub: 'From 124 reviews', icon: Activity, color: 'from-yellow-400 to-yellow-500' },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="relative bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md overflow-hidden group transition-all">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <Icon size={20} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-slate-400 group-hover:text-teal-500 transition-colors" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-1 relative z-10">{stat.value}</p>
            <p className="text-xs font-bold text-slate-500 tracking-wider relative z-10">{stat.label}</p>
            <p className="text-[10px] text-slate-400 relative z-10 mt-1">{stat.sub}</p>
          </div>
        );
      })}
    </section>
  );
};

export default StatsCards;
