import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-32 text-center space-y-5">
      <div className="text-8xl font-bold text-indigo-100">404</div>
      <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex justify-center gap-3 pt-2">
        <Link href="/" className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition">
          Go Home
        </Link>
        <Link href="/resources" className="border px-5 py-2 rounded-lg hover:bg-gray-50 transition">
          Browse Resources
        </Link>
      </div>
    </div>
  );
}
