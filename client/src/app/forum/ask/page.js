'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { CATEGORIES } from '@/lib/constants';
import MarkdownEditor from '@/components/MarkdownEditor';
import Link from 'next/link';

const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300';

function Field({ label, required, children }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function AskForm() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    title: '',
    body: '',
    category: searchParams.get('category') || '',
    tags: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return (
    <div className="text-center py-24 space-y-4">
      <p className="text-gray-600">You need to be logged in to ask a question.</p>
      <Link href="/login" className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition">Login</Link>
    </div>
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const post = await api.post('/api/posts', { ...form, tags });
      addToast('Question posted!');
      router.push(`/forum/${form.category.toLowerCase()}/${post.id}`);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const set = key => e => setForm({ ...form, [key]: e.target.value });

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-8 space-y-5">
      <Field label="Question title" required>
        <input className={inputCls} value={form.title} onChange={set('title')} placeholder="What's your question? Be specific." maxLength={150} />
      </Field>
      <Field label="Details" required>
        <MarkdownEditor value={form.body} onChange={v => setForm(f => ({ ...f, body: v }))} placeholder="Describe your question in detail… markdown supported" rows={7} />
      </Field>
      <Field label="Category" required>
        <select className={inputCls} value={form.category} onChange={set('category')}>
          <option value="">Select a subject</option>
          {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
        </select>
      </Field>
      <Field label="Tags (comma separated)">
        <input className={inputCls} value={form.tags} onChange={set('tags')} placeholder="e.g. photosynthesis, cells, mitosis" />
      </Field>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50">
        {loading ? 'Posting...' : 'Post Question'}
      </button>
    </form>
  );
}

export default function AskPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Link href="/forum" className="text-sm text-indigo-600 hover:underline">← Forum</Link>
      <h1 className="text-3xl font-bold text-gray-900">Ask a Question</h1>
      <Suspense fallback={null}>
        <AskForm />
      </Suspense>
    </div>
  );
}
