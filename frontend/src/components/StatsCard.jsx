import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import useThemeStore from '../store/themeStore';

export default function StatsCard({ title, value, change, icon: Icon, color, onClick }) {
  const { isDark } = useThemeStore();
  
  const colorMap = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', gradient: 'from-blue-500 to-blue-600' },
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', gradient: 'from-emerald-500 to-emerald-600' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', gradient: 'from-purple-500 to-purple-600' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', gradient: 'from-orange-500 to-orange-600' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div 
      onClick={onClick}
      className={`rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 border backdrop-blur-md ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isDark 
          ? 'bg-slate-800/70 border-slate-700/50 hover:bg-slate-850 hover:border-slate-600' 
          : 'bg-white/80 border-gray-200/50 hover:bg-white hover:shadow-xl'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={24} className={c.text} />
        </div>
        <div className={`flex items-center gap-0.5 ${c.text} text-sm font-bold bg-slate-500/5 px-2.5 py-1 rounded-full`}>
          {change}
          <ArrowUpRight size={14} />
        </div>
      </div>
      <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{title}</p>
      <p className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}