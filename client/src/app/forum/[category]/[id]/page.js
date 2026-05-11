'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';
import { timeAgo } from '@/lib/utils';
import MarkdownEditor from '@/components/MarkdownEditor';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import CommentThread from '@/components/CommentThread';

export default function PostPage() {
  const { category, id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [post, setPost]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [related, setRelated]     = useState([]);
  const [answerBody, setAnswerBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cat = CATEGORIES.find(c => c.name.toLowerCase() === category.toLowerCase());

  const loadPost = useCallback(() => {
    api.get(`/api/posts/${id}`)
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadPost(); }, [loadPost]);

  useEffect(() => {
    if (!cat) return;
    api.get(`/api/posts?category=${cat.name}&sort=views`)
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || []);
        setRelated(list.filter(p => p.id !== id).slice(0, 5));
      })
      .catch(() => {});
  }, [cat, id]);

  async function submitAnswer(e) {
    e.preventDefault();
    if (!answerBody.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/api/answers', { postId: id, body: answerBody });
      setAnswerBody('');
      addToast('Answer posted!');
      loadPost();
    } catch (err) {
      addToast(err.message, 'error');
    } finally { setSubmitting(false); }
  }

  async function acceptAnswer(answerId) {
    try { await api.patch(`/api/answers/${answerId}/accept`); loadPost(); }
    catch (err) { addToast(err.message, 'error'); }
  }

  async function upvoteAnswer(answerId) {
    try { await api.patch(`/api/answers/${answerId}/upvote`); loadPost(); } catch {}
  }

  async function upvotePost() {
    try { await api.patch(`/api/posts/${id}/upvote`); loadPost(); } catch {}
  }

  async function deletePost() {
    if (!confirm('Delete this question? All answers will be lost.')) return;
    try {
      await api.delete(`/api/posts/${id}`);
      addToast('Question deleted');
      router.push(`/forum/${category}`);
    } catch (err) { addToast(err.message, 'error'); }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24" />
      <div className="bg-white rounded-2xl border p-8 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-full" />
      </div>
    </div>
  );

  if (!post) return (
    <div className="text-center py-32 space-y-3">
      <p className="text-gray-400">Question not found.</p>
      <Link href={`/forum/${category}`} className="text-indigo-600 hover:underline">← Back to {cat?.name || category}</Link>
    </div>
  );

  const isPostAuthor = user && user.id === post.author;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href={`/forum/${category}`} className="text-sm text-indigo-600 hover:underline">
        ← {cat?.emoji} {cat?.name || category}
      </Link>

      <div className="mt-6 flex gap-8 items-start">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-8">

          {/* Question */}
          <div className="bg-white border rounded-2xl p-8 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
              <div className="flex items-center gap-2 shrink-0">
                {post.hasAcceptedAnswer && (
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">✓ Solved</span>
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${cat?.color || 'bg-gray-100 text-gray-600'}`}>
                  {post.category}
                </span>
              </div>
            </div>

            <MarkdownRenderer content={post.body} className="text-gray-600" />

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/forum/${category}?search=${encodeURIComponent(tag)}`}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded hover:bg-indigo-100 hover:text-indigo-700 transition"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-400 border-t pt-3">
              <button onClick={upvotePost} className="hover:text-indigo-600 transition">▲ {post.upvotes}</button>
              <span>👁 {post.views}</span>
              {post.authorName && (
                <Link href={`/profile/${post.author}`} className="hover:text-indigo-600 transition">
                  by {post.authorName}
                </Link>
              )}
              <span>{timeAgo(post.createdAt)}</span>
              {isPostAuthor && (
                <button onClick={deletePost} className="ml-auto text-red-400 hover:text-red-600 transition text-xs">
                  Delete question
                </button>
              )}
            </div>

            <CommentThread targetId={post.id} />
          </div>

          {/* Answers */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              {post.answers?.length || 0} Answer{post.answers?.length !== 1 ? 's' : ''}
            </h2>

            {post.answers?.map(answer => (
              <div
                key={answer.id}
                className={`bg-white border rounded-xl p-6 space-y-3 ${answer.isAccepted ? 'border-green-400 bg-green-50/30' : ''}`}
              >
                {answer.isAccepted && (
                  <span className="inline-block text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                    ✓ Accepted Answer
                  </span>
                )}
                <MarkdownRenderer content={answer.body} className="text-gray-700" />
                <div className="flex items-center gap-4 text-sm text-gray-400 border-t pt-3">
                  <button onClick={() => upvoteAnswer(answer.id)} className="hover:text-indigo-600 transition">▲ {answer.upvotes}</button>
                  {answer.authorName && (
                    <Link href={`/profile/${answer.author}`} className="hover:text-indigo-600 transition">
                      by {answer.authorName}
                    </Link>
                  )}
                  <span>{timeAgo(answer.createdAt)}</span>
                  {isPostAuthor && !answer.isAccepted && (
                    <button onClick={() => acceptAnswer(answer.id)} className="ml-auto text-green-600 hover:text-green-700 font-medium transition">
                      ✓ Accept
                    </button>
                  )}
                </div>

                <CommentThread targetId={answer.id} />
              </div>
            ))}

            {post.answers?.length === 0 && (
              <div className="bg-white border rounded-xl p-8 text-center space-y-2">
                <p className="text-gray-400">No answers yet.</p>
                <p className="text-sm text-gray-400">Be the first to help!</p>
              </div>
            )}
          </div>

          {/* Answer form */}
          {user ? (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-800">Your Answer</h3>
              <form onSubmit={submitAnswer} className="space-y-3">
                <MarkdownEditor
                  value={answerBody}
                  onChange={setAnswerBody}
                  placeholder="Write your answer here… markdown supported"
                  rows={5}
                />
                <button
                  type="submit"
                  disabled={submitting || !answerBody.trim()}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Answer'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 border rounded-xl p-6 text-center space-y-3">
              <p className="text-gray-600">Log in to post an answer.</p>
              <Link href="/login" className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition">
                Login to Answer
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6 sticky top-24">
          {related.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 text-sm">Related Questions</h3>
              <div className="space-y-2">
                {related.map(p => (
                  <Link
                    key={p.id}
                    href={`/forum/${category}/${p.id}`}
                    className="block bg-white border rounded-xl p-3 hover:border-indigo-300 hover:shadow-sm transition"
                  >
                    <p className="text-sm text-gray-800 line-clamp-2 leading-snug">{p.title}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      {p.hasAcceptedAnswer && <span className="text-green-600 font-medium">✓</span>}
                      <span>💬 {p.answerCount}</span>
                      <span>▲ {p.upvotes}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href={`/forum/${category}`} className="block text-xs text-indigo-600 hover:underline">
                All {cat?.name} questions →
              </Link>
            </div>
          )}

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-indigo-800">Answering tips</h3>
            <ul className="text-xs text-indigo-700 space-y-1 list-disc list-inside">
              <li>Be specific and clear</li>
              <li>Use code blocks for code</li>
              <li>Link to sources when possible</li>
              <li>Check if it's already answered</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
