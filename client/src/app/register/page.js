'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { CATEGORIES } from '@/lib/constants';
import Link from 'next/link';

const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300';

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) { router.replace('/'); return null; }

  function toggleSubject(name) {
    setSubjects(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, subjects);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const set = key => e => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500 text-sm">Join LearnHub — it's completely free</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name">
            <input className={inputCls} value={form.name} onChange={set('name')} placeholder="Your name" required />
          </Field>
          <Field label="Email">
            <input type="email" className={inputCls} value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          </Field>
          <Field label="Password">
            <input type="password" className={inputCls} value={form.password} onChange={set('password')} placeholder="At least 6 characters" required />
          </Field>

          <Field label="Your subjects (choose any)">
            <div className="flex flex-wrap gap-2 pt-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => toggleSubject(cat.name)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${subjects.includes(cat.name) ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-600 hover:border-indigo-300'}`}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          </Field>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
