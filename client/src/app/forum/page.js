'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';
import { api } from '@/lib/api';
import PostCard from '@/components/PostCard';
import { timeAgo } from '@/lib/utils';

export default function ForumPage() {
  const [leaders, setLeaders]   = useState([]);
  const [counts, setCounts]     = useState({});
  const [recent, setRecent]     = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    api.get('/api/leaderboard?limit=5').then(setLeaders).catch(() => {});
    api.get('/api/posts/counts-by-category').then(setCounts).catch(() => {});
    api.get('/api/posts?sort=newest')
      .then(data => setRecent(Array.isArray(data) ? data.slice(0, 8) : (data.data || []).slice(0, 8)))
      .catch(() => setRecent([]))
      .finally(() => setLoadingRecent(false));
  }, []);

  const totalQuestions = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forum</h1>
          {totalQuestions > 0 && (
            <p className="text-sm text-gray-400 mt-1">{totalQuestions} question{totalQuestions !== 1 ? 's' : ''} across all subjects</p>
          )}
        </div>
        <Link href="/forum/ask" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          + Ask a Question
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Categories + Recent */}
        <div className="lg:col-span-2 space-y-8">

          {/* Category cards */}
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-700">Subjects</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {CATEGORIES.map(cat => {
                const count = counts[cat.name] || 0;
                return (
                  <Link
                    key={cat.name}
                    href={`/forum/${cat.name.toLowerCase()}`}
                    className="flex items-center gap-4 bg-white border rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition"
                  >
                    <span className="text-4xl">{cat.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{cat.name}</div>
                      <div className="text-sm text-gray-400">
                        {count > 0 ? `${count} question${count !== 1 ? 's' : ''}` : 'No questions yet'}
                      </div>
                    </div>
                    <span className="ml-auto text-gray-300">→</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Recent Activity</h2>
              <Link href="/forum/ask" className="text-xs text-indigo-600 hover:underline">Ask something →</Link>
            </div>
            {loadingRecent ? (
              <div className="space-y-2 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
              </div>
            ) : recent.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm border rounded-xl bg-white">
                No questions yet — be the first to ask!
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map(p => <PostCard key={p.id} post={p} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Top Contributors */}
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-700">Top Contributors</h2>
            <div className="bg-white border rounded-xl overflow-hidden">
              {leaders.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No data yet.</p>
              ) : (
                <ol className="divide-y">
                  {leaders.map((u, i) => (
                    <li key={u.id}>
                      <Link
                        href={`/profile/${u.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                          ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                          <p className="text-xs text-gray-400">
                            {u.answerCount} answer{u.answerCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-indigo-600 shrink-0">{u.reputation}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
              <div className="border-t px-4 py-2 text-center">
                <Link href="/leaderboard" className="text-xs text-indigo-600 hover:underline">View full leaderboard →</Link>
              </div>
            </div>
          </div>

          {/* Quick tips */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-indigo-800">Forum guidelines</h3>
            <ul className="text-xs text-indigo-700 space-y-1 list-disc list-inside">
              <li>Search before asking a new question</li>
              <li>Be specific and include context</li>
              <li>Mark the best answer as accepted</li>
              <li>Upvote helpful questions &amp; answers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
