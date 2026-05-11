'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { CATEGORIES, FILE_TYPES } from '@/lib/constants';
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

export default function SubmitResourcePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [form, setForm] = useState({ title: '', description: '', externalLink: '', fileType: 'PDF', category: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <p className="text-gray-600">You need to be logged in to share a resource.</p>
      <Link href="/login" className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition">Login</Link>
    </div>
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/resources', form);
      addToast('Resource shared successfully!');
      router.push('/resources');
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const set = key => e => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Link href="/resources" className="text-sm text-indigo-600 hover:underline">← Back to Resources</Link>
      <h1 className="text-3xl font-bold text-gray-900">Share a Resource</h1>
      <p className="text-gray-500 text-sm">Paste an external link (Google Drive, Mega, Dropbox…) — we never store your files.</p>

      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-8 space-y-5">
        <Field label="Title" required>
          <input className={inputCls} value={form.title} onChange={set('title')} placeholder="e.g. Biology 101 Complete Notes" maxLength={120} />
        </Field>
        <Field label="Description">
          <textarea className={inputCls} rows={3} value={form.description} onChange={set('description')} placeholder="What will people learn from this?" maxLength={500} />
        </Field>
        <Field label="Download Link" required>
          <input className={inputCls} type="url" value={form.externalLink} onChange={set('externalLink')} placeholder="https://drive.google.com/..." />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category" required>
            <select className={inputCls} value={form.category} onChange={set('category')}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
            </select>
          </Field>
          <Field label="File Type">
            <select className={inputCls} value={form.fileType} onChange={set('fileType')}>
              {FILE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50">
          {loading ? 'Sharing...' : 'Share Resource'}
        </button>
      </form>
    </div>
  );
}
