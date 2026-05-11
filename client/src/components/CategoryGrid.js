import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';

export default function CategoryGrid({ basePath = '/resources' }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      {CATEGORIES.map(cat => (
        <Link
          key={cat.name}
          href={`${basePath}?category=${cat.name}`}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border hover:border-indigo-300 hover:shadow-md transition text-center"
        >
          <span className="text-3xl">{cat.emoji}</span>
          <span className="text-sm font-medium text-gray-700">{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}
