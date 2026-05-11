'use client';
import { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

export default function MarkdownEditor({ value, onChange, placeholder = 'Write here… markdown supported', rows = 6 }) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-50 border-b px-3 py-1.5">
        <div className="flex gap-1">
          {[
            { label: 'B',  wrap: '**',  title: 'Bold' },
            { label: 'I',  wrap: '*',   title: 'Italic' },
            { label: '<>', wrap: '`',   title: 'Inline code' },
          ].map(({ label, wrap, title }) => (
            <button
              key={label}
              type="button"
              title={title}
              onMouseDown={e => {
                e.preventDefault();
                onChange(value + `${wrap}text${wrap}`);
              }}
              className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded transition"
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPreview(p => !p)}
          className={`text-xs px-3 py-1 rounded-full transition ${preview ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {preview ? (
        <div className="px-4 py-3 min-h-[8rem] text-sm text-gray-700">
          {value ? <MarkdownRenderer content={value} /> : <span className="text-gray-300">Nothing to preview yet.</span>}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-4 py-3 text-sm resize-none focus:outline-none"
        />
      )}

      <div className="bg-gray-50 border-t px-3 py-1 text-xs text-gray-400">
        Supports **bold**, *italic*, `code`, ``` code blocks ```, # headings, - lists
      </div>
    </div>
  );
}
