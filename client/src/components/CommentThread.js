'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { timeAgo } from '@/lib/utils';
import Link from 'next/link';

const COLLAPSE_AT = 3;

function Avatar({ name }) {
  return (
    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 select-none">
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}

export default function CommentThread({ targetId }) {
  const { user } = useAuth();
  const [comments,   setComments]   = useState([]);
  const [expanded,   setExpanded]   = useState(false);
  const [showForm,   setShowForm]   = useState(false);
  const [text,       setText]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!targetId) return;
    api.get(`/api/comments?targetId=${targetId}`)
      .then(setComments)
      .catch(() => {});
  }, [targetId]);

  useEffect(() => {
    if (showForm) inputRef.current?.focus();
  }, [showForm]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const comment = await api.post('/api/comments', { targetId, body: text.trim() });
      setComments(prev => [...prev, comment]);
      setText('');
      setShowForm(false);
      setExpanded(true);
    } catch {}
    setSubmitting(false);
  }

  async function remove(id) {
    await api.delete(`/api/comments/${id}`).catch(() => {});
    setComments(prev => prev.filter(c => c.id !== id));
  }

  const visible = expanded ? comments : comments.slice(0, COLLAPSE_AT);
  const hiddenCount = comments.length - COLLAPSE_AT;

  if (comments.length === 0 && !user) return null;

  return (
    <div className="border-t border-gray-100 mt-4 pt-3 space-y-2.5">
      {/* Comment list */}
      {visible.map(c => (
        <div key={c.id} className="flex gap-2 group">
          <Avatar name={c.authorName} />
          <div className="flex-1 min-w-0 text-sm">
            <Link href={`/profile/${c.author}`} className="font-medium text-gray-700 hover:text-indigo-600 transition mr-1.5">
              {c.authorName}
            </Link>
            <span className="text-gray-600 break-words">{c.body}</span>
            <span className="text-gray-400 text-xs ml-2 whitespace-nowrap">{timeAgo(c.createdAt)}</span>
            {user?.id === c.author && (
              <button
                onClick={() => remove(c.id)}
                className="ml-2 text-xs text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                title="Delete comment"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Show more / fewer */}
      {!expanded && hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="text-xs text-indigo-600 hover:underline"
        >
          Show {hiddenCount} more comment{hiddenCount !== 1 ? 's' : ''}
        </button>
      )}
      {expanded && comments.length > COLLAPSE_AT && (
        <button
          onClick={() => setExpanded(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Show fewer
        </button>
      )}

      {/* Add comment */}
      {user ? (
        showForm ? (
          <form onSubmit={submit} className="flex items-center gap-2 mt-1">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={e => setText(e.target.value.slice(0, 300))}
              placeholder="Add a comment… (300 chars max)"
              className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <span className="text-xs text-gray-400 shrink-0">{text.length}/300</span>
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 shrink-0"
            >
              Post
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setText(''); }}
              className="text-sm text-gray-400 hover:text-gray-600 transition shrink-0"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-gray-400 hover:text-indigo-600 transition"
          >
            + Add a comment
          </button>
        )
      ) : (
        comments.length === 0 ? null : (
          <Link href="/login" className="text-xs text-gray-400 hover:text-indigo-600 transition">
            Log in to comment
          </Link>
        )
      )}
    </div>
  );
}
