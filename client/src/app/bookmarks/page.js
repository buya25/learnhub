'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import ResourceCard from '@/components/ResourceCard';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('all');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get('/api/bookmarks')
      .then(setBookmarks)
      .catch(() => setBookmarks([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="text-center py-32 space-y-4">
      <p className="text-gray-600">You need to be logged in to view bookmarks.</p>
      <Link href="/login" className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition">
        Login
      </Link>
    </div>
  );

  const resources = bookmarks.filter(b => b.type === 'resource').map(b => b.target).filter(Boolean);
  const posts     = bookmarks.filter(b => b.type === 'post').map(b => b.target).filter(Boolean);

  const shown = tab === 'resources' ? resources : tab === 'posts' ? posts : [...resources, ...posts];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>

      <div className="flex gap-1 text-sm">
        {[
          { key: 'all',       label: `All (${bookmarks.length})` },
          { key: 'resources', label: `Resources (${resources.length})` },
          { key: 'posts',     label: `Questions (${posts.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-1 rounded-full transition ${tab === key ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
        </div>
      )}

      {!loading && shown.length === 0 && (
        <div className="text-center py-20 text-gray-400 space-y-3">
          <svg className="w-12 h-12 mx-auto opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p className="font-medium">No bookmarks yet</p>
          <p className="text-sm">Save resources and questions to find them here later</p>
          <div className="flex gap-3 justify-center">
            <Link href="/resources" className="text-sm text-indigo-600 hover:underline">Browse Resources</Link>
            <Link href="/forum"     className="text-sm text-indigo-600 hover:underline">Browse Forum</Link>
          </div>
        </div>
      )}

      {!loading && (tab === 'all' || tab === 'resources') && resources.length > 0 && (
        <div className="space-y-3">
          {tab === 'all' && <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Resources</h2>}
          <div className="grid sm:grid-cols-2 gap-4">
            {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </div>
      )}

      {!loading && (tab === 'all' || tab === 'posts') && posts.length > 0 && (
        <div className="space-y-3">
          {tab === 'all' && <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Questions</h2>}
          <div className="space-y-3">
            {posts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
