'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ResourceCard from '@/components/ResourceCard';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    setQuery(q);
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    api.get(`/api/search?q=${encodeURIComponent(q)}`)
      .then(setResults)
      .catch(() => setResults({ resources: [], posts: [], total: 0 }))
      .finally(() => setLoading(false));
  }, [q]);

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  const resources = results?.resources || [];
  const posts     = results?.posts || [];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search resources, questions…"
          className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          autoFocus
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
        >
          Search
        </button>
      </form>

      {!q && (
        <div className="text-center py-24 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>Enter a search term above</p>
        </div>
      )}

      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
        </div>
      )}

      {results && !loading && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {results.total} result{results.total !== 1 ? 's' : ''} for <strong>"{q}"</strong>
            </p>
            <div className="flex gap-1 text-sm">
              {['all', 'resources', 'posts'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded-full capitalize transition ${tab === t ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {t} {t === 'resources' ? `(${resources.length})` : t === 'posts' ? `(${posts.length})` : `(${results.total})`}
                </button>
              ))}
            </div>
          </div>

          {results.total === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="font-medium">No results found</p>
              <p className="text-sm mt-1">Try different keywords or browse by category</p>
              <div className="flex gap-3 justify-center mt-4">
                <Link href="/resources" className="text-sm text-indigo-600 hover:underline">Browse Resources</Link>
                <Link href="/forum"     className="text-sm text-indigo-600 hover:underline">Browse Forum</Link>
              </div>
            </div>
          )}

          {(tab === 'all' || tab === 'resources') && resources.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Resources ({resources.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
              </div>
            </div>
          )}

          {(tab === 'all' || tab === 'posts') && posts.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Questions ({posts.length})
              </h2>
              <div className="space-y-3">
                {posts.map(p => <PostCard key={p.id} post={p} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Search</h1>
      <Suspense fallback={null}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
