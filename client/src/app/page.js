import Link from 'next/link';
import CategoryGrid from '@/components/CategoryGrid';
import ResourceCard from '@/components/ResourceCard';
import PostCard from '@/components/PostCard';

const API = 'http://localhost:5000';

async function fetchJSON(path) {
  try {
    const res = await fetch(`${API}${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function StatCard({ value, label, icon }) {
  return (
    <div className="bg-white rounded-xl border p-5 text-center space-y-1">
      <div className="text-2xl">{icon}</div>
      <div className="text-3xl font-black text-indigo-600">{value ?? '—'}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

export default async function HomePage() {
  const [stats, trendingResources, hotPosts, latestResources] = await Promise.all([
    fetchJSON('/api/stats'),
    fetchJSON('/api/resources?sort=popular'),
    fetchJSON('/api/posts?sort=views'),
    fetchJSON('/api/resources'),
  ]);

  const trending = Array.isArray(trendingResources) ? trendingResources.slice(0, 4) : [];
  const hot      = Array.isArray(hotPosts)          ? hotPosts.slice(0, 5)          : [];
  const latest   = Array.isArray(latestResources)   ? latestResources.slice(0, 4)   : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">

      {/* Hero */}
      <section className="text-center space-y-5">
        <div className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
          100% Free · No sign-up required to browse
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Free Learning,<br />
          <span className="text-indigo-600">For Everyone</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Share downloadable resources, ask questions, and help others learn — completely free, forever.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href="/resources" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
            Browse Resources
          </Link>
          <Link href="/forum" className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition">
            Visit Forum
          </Link>
        </div>
      </section>

      {/* Stats strip */}
      {stats && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon="📚" value={stats.resources} label="Resources" />
          <StatCard icon="💬" value={stats.posts}     label="Questions" />
          <StatCard icon="✅" value={stats.answers}   label="Answers" />
          <StatCard icon="👥" value={stats.users}     label="Learners" />
        </section>
      )}

      {/* Trending resources */}
      {trending.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">🔥 Most Downloaded</h2>
              <p className="text-sm text-gray-400 mt-0.5">Resources the community loves most</p>
            </div>
            <Link href="/resources?sort=popular" className="text-indigo-600 text-sm hover:underline">See all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trending.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </section>
      )}

      {/* Hot questions */}
      {hot.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">👀 Hot Questions</h2>
              <p className="text-sm text-gray-400 mt-0.5">Most-viewed discussions right now</p>
            </div>
            <Link href="/forum" className="text-indigo-600 text-sm hover:underline">See all →</Link>
          </div>
          <div className="space-y-3">
            {hot.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        </section>
      )}

      {/* Browse by Subject */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Browse by Subject</h2>
          <Link href="/forum/ask" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
            + Ask a Question
          </Link>
        </div>
        <CategoryGrid basePath="/resources" />
      </section>

      {/* Latest resources */}
      {latest.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">🆕 Just Added</h2>
              <p className="text-sm text-gray-400 mt-0.5">Freshly shared by the community</p>
            </div>
            <Link href="/resources" className="text-indigo-600 text-sm hover:underline">See all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {latest.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </section>
      )}

      {/* Empty state CTA */}
      {trending.length === 0 && hot.length === 0 && latest.length === 0 && (
        <section className="text-center py-16 space-y-4">
          <p className="text-gray-400 text-lg">No content yet — be the first to contribute!</p>
          <div className="flex justify-center gap-3">
            <Link href="/resources/submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition">
              Share a Resource
            </Link>
            <Link href="/forum/ask" className="border px-5 py-2 rounded-lg hover:bg-gray-50 transition">
              Ask a Question
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
