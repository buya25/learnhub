'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ResourceCard from '@/components/ResourceCard';
import { api } from '@/lib/api';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest' },
  { value: 'popular', label: 'Most Downloaded' },
  { value: 'upvotes', label: 'Most Upvoted' },
];

function ResourcesContent() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [sort, setSort]       = useState('newest');
  const [page, setPage]       = useState(1);
  const [meta, setMeta]       = useState({ total: 0, pages: 1 });

  useEffect(() => { setPage(1); }, [activeCategory, search, sort]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort, page, limit: 12 });
    if (activeCategory) params.set('category', activeCategory);
    if (search)         params.set('search', search);
    api.get(`/api/resources?${params}`)
      .then(res => {
        setResources(res.data ?? res);
        if (res.pages) setMeta({ total: res.total, pages: res.pages });
      })
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [activeCategory, search, sort, page]);

  return (
    <div className="space-y-6">
      {/* Search + Sort row */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search resources..."
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

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2">
        <Link href="/resources" className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${!activeCategory ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-600 hover:border-indigo-300'}`}>
          All
        </Link>
        {CATEGORIES.map(cat => (
          <Link
            key={cat.name}
            href={`/resources?category=${cat.name}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${activeCategory === cat.name ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-600 hover:border-indigo-300'}`}
          >
            {cat.emoji} {cat.name}
          </Link>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-5 space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-gray-400">No resources found.</p>
          <Link href="/resources/submit" className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition">
            Be the first to share one
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400">{meta.total || resources.length} result{(meta.total || resources.length) !== 1 ? 's' : ''}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>

          {/* Pagination */}
          {meta.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
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

export default function ResourcesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
        <Link href="/resources/submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          + Share Resource
        </Link>
      </div>
      <Suspense fallback={<p className="text-center py-8 text-gray-400">Loading...</p>}>
        <ResourcesContent />
      </Suspense>
    </div>
  );
}
