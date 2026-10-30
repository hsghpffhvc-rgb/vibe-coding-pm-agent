'use client';

import { useState } from 'react';
import { Check, ChevronDown, Copy, Download, FileText } from 'lucide-react';
import { Markdown } from './Markdown';
import { copyText, downloadMarkdown, safeFilename } from '@/lib/export';

interface DocCardProps {
  title: string;
  markdown: string;
}

export function DocCard({ title, markdown }: DocCardProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(true);

  const handleCopy = async () => {
    const ok = await copyText(markdown);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-glass">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-brand-400" />
          <span className="truncate text-sm font-medium text-zinc-100">{title}</span>
          <span className="hidden shrink-0 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-400 sm:inline">
            8 节 · 可直接执行
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[11px] text-zinc-300 transition hover:border-white/20 hover:text-zinc-100"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copied ? '已复制' : '复制'}
          </button>
          <button
            type="button"
            onClick={() => downloadMarkdown(safeFilename(title), markdown)}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[11px] text-zinc-300 transition hover:border-white/20 hover:text-zinc-100"
          >
            <Download className="h-3 w-3" />
            .md
          </button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg border border-white/10 p-1 text-zinc-400 transition hover:text-zinc-100"
            aria-label="折叠文档"
          >
            <ChevronDown className={'h-3.5 w-3.5 transition ' + (open ? '' : '-rotate-90')} />
          </button>
        </div>
      </div>
      {open ? (
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <Markdown>{markdown}</Markdown>
        </div>
      ) : null}
    </div>
  );
}
