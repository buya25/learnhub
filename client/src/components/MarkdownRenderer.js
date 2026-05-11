import { renderMarkdown } from '@/lib/markdown';

export default function MarkdownRenderer({ content, className = '' }) {
  return (
    <div
      className={`prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
