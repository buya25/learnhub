'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function BookmarkButton({ targetId, type, className = '' }) {
  const { user } = useAuth();
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get('/api/bookmarks')
      .then(bks => setSaved(bks.some(b => b.targetId === targetId)))
      .catch(() => {});
  }, [user, targetId]);

  if (!user) return null;

  async function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      if (saved) {
        await api.delete(`/api/bookmarks/${targetId}`);
        setSaved(false);
      } else {
        await api.post('/api/bookmarks', { targetId, type });
        setSaved(true);
      }
    } catch {}
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? 'Remove bookmark' : 'Bookmark'}
      className={`text-gray-400 hover:text-indigo-500 transition disabled:opacity-50 ${className}`}
    >
      {saved ? (
        <svg className="w-4 h-4 fill-indigo-500 stroke-indigo-500" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
    </button>
  );
}
