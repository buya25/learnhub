'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  function handleLogout() {
    logout();
    router.push('/');
    setMenuOpen(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setMenuOpen(false);
  }

  function linkCls(href) {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href));
    return `transition ${active ? 'text-indigo-600 font-semibold' : 'text-gray-600 hover:text-indigo-600'}`;
  }

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="text-xl font-bold text-indigo-600 shrink-0">LearnHub</Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
          <div className="relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50"
            />
          </div>
        </form>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5 text-sm font-medium ml-auto">
          <Link href="/resources" className={linkCls('/resources')}>Resources</Link>
          <Link href="/forum"     className={linkCls('/forum')}>Forum</Link>
          {user ? (
            <>
              <Link href="/bookmarks" className={linkCls('/bookmarks')} title="Bookmarks">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </Link>
              <NotificationBell />
              <Link href="/dashboard" className={linkCls('/dashboard')}>{user.name}</Link>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login"    className={linkCls('/login')}>Login</Link>
              <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Sign up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition ml-auto"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 flex flex-col gap-3 text-sm font-medium">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs">Go</button>
          </form>
          <Link href="/resources" className={linkCls('/resources')} onClick={() => setMenuOpen(false)}>Resources</Link>
          <Link href="/forum"     className={linkCls('/forum')}     onClick={() => setMenuOpen(false)}>Forum</Link>
          {user ? (
            <>
              <Link href="/bookmarks" className={linkCls('/bookmarks')} onClick={() => setMenuOpen(false)}>Bookmarks</Link>
              <Link href="/dashboard" className={linkCls('/dashboard')} onClick={() => setMenuOpen(false)}>{user.name}</Link>
              <button onClick={handleLogout} className="text-left text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login"    className={linkCls('/login')}    onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" className={linkCls('/register')} onClick={() => setMenuOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
