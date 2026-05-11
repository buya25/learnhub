'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { api } from '@/lib/api';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest' },
  { value: 'popular', label: 'Most Upvoted' },
  { value: 'views',   label: 'Most Viewed' },
];

const FILTER_TABS = [
  { value: 'all',        label: 'All' },
  { value: 'unanswered', label: 'Unanswered' },
  { value: 'solved',     label: 'Solved' },
];

export default function CategoryForumPage() {
  const { category } = useParams();
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [sort, setSort]       = useState('newest');
  const [filter, setFilter]   = useState('all');
  const [page, setPage]       = useState(1);
  const [meta, setMeta]       = useState({ total: 0, pages: 1 });

  const cat         = CATEGORIES.find(c => c.name.toLowerCase() === category.toLowerCase());
  const displayName = cat?.name || category;

  useEffect(() => { setPage(1); }, [search, sort, filter, category]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ category: displayName, sort, page, limit: 10 });
    if (search) params.set('search', search);
    if (filter === 'unanswered') params.set('unanswered', '1');

    api.get(`/api/posts?${params}`)
      .then(res => {
        let data = res.data ?? res;
        // client-side solved filter (hasAcceptedAnswer comes from withMeta)
        if (filter === 'solved') data = data.filter(p => p.hasAcceptedAnswer);
        setPosts(data);
        if (res.pages) setMeta({ total: res.total, pages: res.pages });
        else setMeta({ total: data.length, pages: 1 });
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [category, search, sort, filter, page, displayName]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <Link href="/forum" className="text-sm text-indigo-600 hover:underline">← All Subjects</Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{cat?.emoji} {displayName}</h1>
        <Link
          href={`/forum/ask?category=${displayName}`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          + Ask Question
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b">
        {FILTER_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
              filter === t.value
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder={`Search ${displayName} questions…`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-5 space-y-2 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-gray-400 text-lg">
            {filter === 'unanswered' ? 'All questions have answers — great community!' :
             filter === 'solved'     ? 'No solved questions yet.' :
             `No questions in ${displayName} yet.`}
          </p>
          {filter === 'all' && (
            <Link
              href={`/forum/ask?category=${displayName}`}
              className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Be the first to ask!
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400">
            {posts.length} question{posts.length !== 1 ? 's' : ''}
            {filter !== 'all' ? ` · ${FILTER_TABS.find(t => t.value === filter)?.label}` : ''}
          </p>
          <div className="space-y-3">
            {posts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
          {meta.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 transition"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-500">Page {page} of {meta.pages}</span>
              <button
                onClick={() => setPage(p => Math.min(meta.pages, p + 1))}
                disabled={page === meta.pages}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 transition"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
