'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import ResourceCard from '@/components/ResourceCard';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';
import { timeAgo } from '@/lib/utils';

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('resources');

  useEffect(() => {
    api.get(`/api/users/${id}`)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 animate-pulse">
      <div className="bg-white border rounded-2xl p-8 flex gap-6">
        <div className="w-16 h-16 rounded-full bg-gray-200" />
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gray-200 rounded w-40" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="text-center py-32 space-y-3">
      <p className="text-gray-400">User not found.</p>
      <Link href="/" className="text-indigo-600 hover:underline">← Go Home</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

      {/* Profile Card */}
      <div className="bg-white border rounded-2xl p-8 flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 shrink-0">
          {profile.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          <div className="flex flex-wrap gap-2">
            {profile.subjects?.map(s => {
              const cat = CATEGORIES.find(c => c.name === s);
              return (
                <span key={s} className={`text-xs px-2 py-0.5 rounded-full ${cat?.color || 'bg-gray-100 text-gray-600'}`}>
                  {cat?.emoji} {s}
                </span>
              );
            })}
          </div>
          <p className="text-xs text-gray-400">Joined {timeAgo(profile.createdAt)}</p>
        </div>
        <div className="grid grid-cols-3 gap-6 text-center shrink-0">
          <div>
            <div className="text-2xl font-bold text-indigo-600">{profile.reputation}</div>
            <div className="text-xs text-gray-400">rep</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{profile.resourceCount}</div>
            <div className="text-xs text-gray-400">resources</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{profile.answerCount}</div>
            <div className="text-xs text-gray-400">answers</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {[
          { key: 'resources', label: `Resources (${profile.resourceCount})` },
          { key: 'questions', label: `Questions (${profile.postCount})` },
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

      {tab === 'resources' && (
        profile.resources.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No resources shared yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.resources.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        )
      )}

      {tab === 'questions' && (
        profile.posts.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No questions asked yet.</p>
        ) : (
          <div className="space-y-3">
            {profile.posts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )
      )}
    </div>
  );
}
