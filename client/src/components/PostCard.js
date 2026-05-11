import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';
import { timeAgo } from '@/lib/utils';
import BookmarkButton from './BookmarkButton';

export default function PostCard({ post }) {
  const cat  = CATEGORIES.find(c => c.name === post.category);
  const href = `/forum/${post.category.toLowerCase()}/${post.id}`;

  return (
    <div className="bg-white rounded-xl border p-5 hover:shadow-md transition">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link href={href} className="font-semibold text-gray-900 line-clamp-2 hover:text-indigo-700 transition flex-1">
          {post.title}
        </Link>
        <div className="flex items-center gap-1.5 shrink-0">
          {post.hasAcceptedAnswer && (
            <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full" title="Has accepted answer">
              ✓ Solved
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full ${cat?.color || 'bg-gray-100 text-gray-600'}`}>
            {post.category}
          </span>
          <BookmarkButton targetId={post.id} type="post" />
        </div>
      </div>

      <Link href={href} className="block">
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.body}</p>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex gap-3">
            <span>▲ {post.upvotes}</span>
            <span>👁 {post.views}</span>
            <span className={`font-medium ${post.answerCount > 0 ? 'text-green-600' : ''}`}>
              💬 {post.answerCount ?? 0}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            {post.authorName && <span>by {post.authorName}</span>}
            <span>·</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
