'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import ResourceCard from '@/components/ResourceCard';
import PostCard from '@/components/PostCard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';
import { timeAgo } from '@/lib/utils';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('resources');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get(`/api/users/${user.id}`).then(setProfile).catch(() => {});
  }, [user]);

  if (loading || !user) return null;

  const myResources = profile?.resources || [];
  const myPosts     = profile?.posts     || [];
  const myAnswers   = profile?.answers   || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

      {/* Profile Header */}
      <div className="bg-white border rounded-2xl p-8 flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 shrink-0">
          {user.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
          {user.subjects?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {user.subjects.map(s => {
                const cat = CATEGORIES.find(c => c.name === s);
                return (
                  <span key={s} className={`text-xs px-2 py-0.5 rounded-full ${cat?.color || 'bg-gray-100 text-gray-600'}`}>
                    {cat?.emoji} {s}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <div className="text-center shrink-0">
          <div className="text-3xl font-bold text-indigo-600">{user.reputation}</div>
          <div className="text-xs text-gray-400 mt-0.5">reputation</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {[
          { key: 'resources', label: `Resources (${myResources.length})` },
          { key: 'questions', label: `Questions (${myPosts.length})` },
          { key: 'answers',   label: `Answers (${myAnswers.length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${tab === t.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Resources tab */}
      {tab === 'resources' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href="/resources/submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
              + Share Resource
            </Link>
          </div>
          {myResources.length === 0 ? (
            <p className="text-center text-gray-400 py-16">You haven't shared any resources yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myResources.map(r => <ResourceCard key={r.id} resource={r} />)}
            </div>
          )}
        </div>
      )}

      {/* Questions tab */}
      {tab === 'questions' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href="/forum/ask" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
              + Ask Question
            </Link>
          </div>
          {myPosts.length === 0 ? (
            <p className="text-center text-gray-400 py-16">You haven't asked any questions yet.</p>
          ) : (
            <div className="space-y-3">
              {myPosts.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </div>
      )}

      {/* Answers tab */}
      {tab === 'answers' && (
        <div className="space-y-4">
          {myAnswers.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-gray-400">You haven't answered any questions yet.</p>
              <Link href="/forum" className="inline-block border px-5 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                Browse the Forum
              </Link>
            </div>
          ) : (
            myAnswers.map(a => (
              <Link
                key={a.id}
                href={`/forum/${a.postCategory.toLowerCase()}/${a.postId}`}
                className="block bg-white border rounded-xl p-5 hover:shadow-md transition space-y-2"
              >
                <div className="flex items-center gap-2">
                  {a.isAccepted && <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">✓ Accepted</span>}
                  <p className="text-sm font-medium text-gray-700 line-clamp-1">Re: {a.postTitle}</p>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{a.body}</p>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>▲ {a.upvotes}</span>
                  <span>{timeAgo(a.createdAt)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
