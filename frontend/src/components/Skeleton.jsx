import React from 'react';
import useThemeStore from '../store/themeStore';

export function SkeletonRow({ cols = 5 }) {
  const { isDark } = useThemeStore();
  const bgClass = isDark ? 'bg-slate-800' : 'bg-slate-100';

  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3.5 w-10">
        <div className={`w-3.5 h-3.5 rounded ${bgClass}`}></div>
      </td>
      {Array(cols).fill(0).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className={`h-3 rounded w-3/4 ${bgClass}`}></div>
        </td>
      ))}
      <td className="px-4 py-3.5 text-right w-20">
        <div className={`h-5 rounded-lg w-12 ml-auto ${bgClass}`}></div>
      </td>
    </tr>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <table className="w-full text-left border-collapse">
      <tbody>
        {Array(rows).fill(0).map((_, idx) => (
          <SkeletonRow key={idx} cols={cols} />
        ))}
      </tbody>
    </table>
  );
}

export function SkeletonCard() {
  const { isDark } = useThemeStore();
  const bgClass = isDark ? 'bg-slate-800' : 'bg-slate-100';

  return (
    <div className={`p-5 rounded-2xl border space-y-4 animate-pulse ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xs'
    }`}>
      <div className={`h-4 rounded w-1/3 ${bgClass}`}></div>
      <div className="space-y-2.5">
        <div className={`h-3 rounded w-full ${bgClass}`}></div>
        <div className={`h-3 rounded w-5/6 ${bgClass}`}></div>
        <div className={`h-3 rounded w-4/5 ${bgClass}`}></div>
      </div>
      <div className={`h-7 rounded-xl w-24 ${bgClass}`}></div>
    </div>
  );
}

export function SkeletonStats() {
  const { isDark } = useThemeStore();
  const bgClass = isDark ? 'bg-slate-800' : 'bg-slate-100';

  return (
    <div className={`p-4.5 rounded-2xl border flex items-center justify-between animate-pulse ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xs'
    }`}>
      <div className="space-y-2">
        <div className={`h-3 rounded w-16 ${bgClass}`}></div>
        <div className={`h-6 rounded w-24 ${bgClass}`}></div>
      </div>
      <div className={`w-10 h-10 rounded-xl ${bgClass}`}></div>
    </div>
  );
}
export default SkeletonCard;
