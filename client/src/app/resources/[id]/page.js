'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { CATEGORIES } from '@/lib/constants';
import { timeAgo } from '@/lib/utils';

export default function ResourcePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.get(`/api/resources/${id}`)
      .then(setResource)
      .catch(() => setResource(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleUpvote() {
    try {
      const updated = await api.patch(`/api/resources/${id}/upvote`);
      setResource(updated);
      addToast('Upvoted!');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this resource? This cannot be undone.')) return;
    try {
      await api.delete(`/api/resources/${id}`);
      addToast('Resource deleted');
      router.push('/resources');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24" />
      <div className="bg-white rounded-2xl border p-8 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
      </div>
    </div>
  );

  if (!resource) return (
    <div className="text-center py-32 space-y-3">
      <p className="text-gray-400">Resource not found.</p>
      <Link href="/resources" className="text-indigo-600 hover:underline">← Back to Resources</Link>
    </div>
  );

  const cat = CATEGORIES.find(c => c.name === resource.category);
  const isOwner = user && user.id === resource.uploadedBy;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <Link href="/resources" className="text-sm text-indigo-600 hover:underline">← Back to Resources</Link>

      <div className="bg-white rounded-2xl border p-8 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{resource.title}</h1>
          <span className={`text-sm px-3 py-1 rounded-full shrink-0 ${cat?.color || 'bg-gray-100 text-gray-600'}`}>
            {resource.category}
          </span>
        </div>

        {resource.description && (
          <p className="text-gray-600 leading-relaxed">{resource.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t pt-4">
          <span>📄 {resource.fileType}</span>
          <span>⬇ {resource.downloads} downloads</span>
          <span>▲ {resource.upvotes} upvotes</span>
          {resource.authorName && (
            <Link href={`/profile/${resource.uploadedBy}`} className="hover:text-indigo-600 transition">
              by {resource.authorName}
            </Link>
          )}
          <span>{timeAgo(resource.createdAt)}</span>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href={resource.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Download / Open ↗
          </a>

          {user && (
            <button
              onClick={handleUpvote}
              className="flex items-center gap-2 border px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              ▲ Upvote
            </button>
          )}

          {isOwner && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 border border-red-200 text-red-500 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
