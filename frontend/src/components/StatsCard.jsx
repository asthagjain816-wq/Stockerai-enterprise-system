import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function StatsCard({ title, value, change, icon: Icon, color }) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600', gradient: 'from-green-500 to-green-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', gradient: 'from-purple-500 to-purple-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', gradient: 'from-orange-500 to-orange-600' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${c.bg}`}>
          <Icon size={24} className={c.text} />
        </div>
        <div className={`flex items-center gap-1 ${c.text} text-sm font-semibold`}>
          <ArrowUpRight size={16} />
          {change}
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}