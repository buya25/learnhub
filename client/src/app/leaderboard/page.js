'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/leaderboard?limit=50')
      .then(setLeaders)
      .catch(() => setLeaders([]))
      .finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div>
        <Link href="/forum" className="text-sm text-indigo-600 hover:underline">← Forum</Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Leaderboard</h1>
        <p className="text-gray-500 text-sm mt-1">Top contributors ranked by reputation</p>
      </div>

      {loading && (
        <div className="space-y-2 animate-pulse">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
        </div>
      )}

      {!loading && (
        <div className="bg-white border rounded-xl overflow-hidden divide-y">
          {leaders.map((u, i) => (
            <Link
              key={u.id}
              href={`/profile/${u.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition"
            >
              <div className="w-8 text-center text-lg shrink-0">
                {i < 3 ? medals[i] : <span className="text-sm font-bold text-gray-400">#{i + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {u.answerCount} answer{u.answerCount !== 1 ? 's' : ''} · {u.postCount} question{u.postCount !== 1 ? 's' : ''}
                  {u.subjects?.length > 0 && ` · ${u.subjects.slice(0, 2).join(', ')}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg font-bold text-indigo-600">{u.reputation}</span>
                <p className="text-xs text-gray-400">rep</p>
              </div>
            </Link>
          ))}
          {leaders.length === 0 && (
            <p className="text-center text-gray-400 py-16">No users yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
