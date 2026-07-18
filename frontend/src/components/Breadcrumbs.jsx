import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import useThemeStore from '../store/themeStore';

export default function Breadcrumbs() {
  const location = useLocation();
  const { isDark } = useThemeStore();
  const path = location.pathname;

  // Render home icon if on dashboard
  if (path === '/dashboard') {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none pb-2">
        <Home size={11} className="text-blue-650" />
        <span>Dashboard</span>
      </div>
    );
  }

  // Parse location path to segments
  const segments = path.split('/').filter(x => x);
  
  return (
    <nav className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none pb-2">
      <Link to="/dashboard" className="hover:text-blue-600 flex items-center gap-1">
        <Home size={10} className="text-slate-400" />
        Dashboard
      </Link>

      {segments.map((seg, idx) => {
        const routeTo = `/${segments.slice(0, idx + 1).join('/')}`;
        const isLast = idx === segments.length - 1;
        let displayName = seg;
        
        if (seg === 'analytics') displayName = 'Reports';
        else if (seg === 'security-center') displayName = 'Security';

        return (
          <React.Fragment key={seg}>
            <ChevronRight size={10} className="text-slate-350" />
            {isLast ? (
              <span className="text-blue-605 dark:text-blue-400">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-blue-600">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
