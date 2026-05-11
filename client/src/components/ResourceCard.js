import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';
import { timeAgo } from '@/lib/utils';
import BookmarkButton from './BookmarkButton';

export default function ResourceCard({ resource }) {
  const cat = CATEGORIES.find(c => c.name === resource.category);

  return (
    <div className="bg-white rounded-xl border p-5 hover:shadow-md transition flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{resource.title}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs px-2 py-1 rounded-full ${cat?.color || 'bg-gray-100 text-gray-600'}`}>
            {resource.category}
          </span>
          <BookmarkButton targetId={resource.id} type="resource" />
        </div>
      </div>

      {resource.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{resource.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
        <span>{resource.fileType}</span>
        <span>⬇ {resource.downloads} · ▲ {resource.upvotes}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        {resource.authorName ? (
          <Link href={`/profile/${resource.uploadedBy}`} className="hover:text-indigo-600 transition truncate">
            by {resource.authorName}
          </Link>
        ) : <span />}
        <span className="shrink-0">{timeAgo(resource.createdAt)}</span>
      </div>

      <Link
        href={`/resources/${resource.id}`}
        className="text-center text-sm bg-indigo-50 text-indigo-700 font-medium py-2 rounded-lg hover:bg-indigo-100 transition"
      >
        View Resource
      </Link>
    </div>
  );
}
