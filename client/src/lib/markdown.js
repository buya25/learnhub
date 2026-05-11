export function renderMarkdown(text) {
  if (!text) return '';

  // Extract and protect code blocks from HTML escaping
  const blocks = [];
  let s = text.replace(/```([\s\S]*?)```/g, (_, code) => {
    const i = blocks.length;
    blocks.push(code.trim());
    return `\x00BLOCK${i}\x00`;
  });

  // Escape HTML
  s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Restore code blocks (with their own escaping)
  s = s.replace(/\x00BLOCK(\d+)\x00/g, (_, i) => {
    const code = blocks[i].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre class="bg-gray-100 rounded-lg p-4 my-3 overflow-x-auto text-sm font-mono leading-relaxed"><code>${code}</code></pre>`;
  });

  // Inline code
  s = s.replace(/`([^`\n]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  // Bold and italic
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*\n]+)\*/g,     '<em>$1</em>');

  // Process line by line
  const lines = s.split('\n');
  const out   = [];
  let inUL = false, inOL = false;

  for (const line of lines) {
    const isUL = /^[-*] /.test(line);
    const isOL = /^\d+\. /.test(line);

    if (!isUL && inUL) { out.push('</ul>'); inUL = false; }
    if (!isOL && inOL) { out.push('</ol>'); inOL = false; }

    if      (/^### /.test(line))  out.push(`<h3 class="text-lg font-semibold mt-4 mb-1">${line.slice(4)}</h3>`);
    else if (/^## /.test(line))   out.push(`<h2 class="text-xl font-bold mt-5 mb-2">${line.slice(3)}</h2>`);
    else if (/^# /.test(line))    out.push(`<h1 class="text-2xl font-bold mt-5 mb-2">${line.slice(2)}</h1>`);
    else if (/^&gt; /.test(line)) out.push(`<blockquote class="border-l-4 border-indigo-300 pl-4 italic text-gray-600 my-2">${line.slice(5)}</blockquote>`);
    else if (isUL) {
      if (!inUL) { out.push('<ul class="list-disc list-inside my-2 space-y-0.5">'); inUL = true; }
      out.push(`<li>${line.replace(/^[-*] /, '')}</li>`);
    }
    else if (isOL) {
      if (!inOL) { out.push('<ol class="list-decimal list-inside my-2 space-y-0.5">'); inOL = true; }
      out.push(`<li>${line.replace(/^\d+\. /, '')}</li>`);
    }
    else if (line.trim() === '') out.push('<div class="h-2"></div>');
    else out.push(`<p class="leading-relaxed">${line}</p>`);
  }

  if (inUL) out.push('</ul>');
  if (inOL) out.push('</ol>');

  return out.join('');
}
