import React from 'react';

export default function HighlightText({ text, search }) {
  if (text === null || text === undefined) return null;
  const stringText = text.toString();
  if (!search || !search.trim()) return <span>{stringText}</span>;

  const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearch})`, 'gi');
  const parts = stringText.split(regex);

  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200/80 dark:bg-yellow-500/25 dark:text-yellow-200 text-slate-900 px-0.5 rounded font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}
