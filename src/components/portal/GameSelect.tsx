'use client';

import React, { useEffect, useState } from 'react';

interface GameOption {
  id: string;
  title: string;
  author?: string;
}

interface GameSelectProps {
  value: string;
  onChange: (gameId: string) => void;
  className?: string;
  /** extra fixed options shown at the end, e.g. { value: 'other', label: 'Other / Custom URL' } */
  extraOptions?: { value: string; label: string }[];
  renderLabel?: (title: string, author?: string) => string;
}

/** A search box + dropdown that stays fast with thousands of games via lightweight API fetch. */
export function GameSelect({ value, onChange, className = '', extraOptions = [], renderLabel }: GameSelectProps) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<GameOption[]>([]);

  useEffect(() => {
    let active = true;
    const fetchGames = async () => {
      try {
        const q = query.trim().toLowerCase();
        const url = q ? `/api/games?search=${encodeURIComponent(q)}&limit=30` : `/api/games?limit=30`;
        const res = await fetch(url);
        if (res.ok && active) {
          const data = await res.json();
          if (data?.games) {
            setOptions(data.games.map((g: any) => ({ id: g.id, title: g.title, author: g.developer_name })));
          }
        }
      } catch {}
    };

    const timer = setTimeout(fetchGames, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="space-y-1.5">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search games by name…"
        className="w-full bg-arcade-midnight/80 border border-arcade-border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-arcade-champagne"
      />
      <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
        {options.map((g) => (
          <option key={g.id} value={g.id}>{renderLabel ? renderLabel(g.title, g.author) : g.title}</option>
        ))}
        {extraOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
