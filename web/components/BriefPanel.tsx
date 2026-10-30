'use client';

import { useState } from 'react';
import { Check, Copy, Download, Sparkles } from 'lucide-react';
import { DIMENSIONS } from '@/lib/interview';
import { copyText, downloadMarkdown, safeFilename } from '@/lib/export';
import type { Brief } from '@/lib/types';

interface BriefPanelProps {
  brief: Brief;
  busy: boolean;
  doc: { title: string; markdown: string } | null;
  onGenerate: () => void;
}

export function BriefPanel({ brief, busy, doc, onGenerate }: BriefPanelProps) {
  const [copied, setCopied] = useState(false);
  const filled = DIMENSIONS.filter((item) => (brief[item.id] || '').trim()).length;
  const total = DIMENSIONS.length;

  const handleCopy = async () => {
    if (!doc) return;
    const ok = await copyText(doc.markdown);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <aside className="hidden w-[340px] shrink-0 flex-col border-l border-white/[0.06] bg-black/40 backdrop-blur-xl xl:flex">
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-zinc-100">产品简报</p>
          <p className="text-[11px] text-zinc-500">边聊边补全 10 个字段</p>
        </div>
        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-400">
          {filled}/{total}
        </span>
      </div>

      <div className="px-4">
        <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300"
            style={{ width: Math.round((filled / total) * 100) + '%' }}
          />
        </div>
      </div>

      <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto px-3 pb-3">
        {DIMENSIONS.map((item) => {
          const value = (brief[item.id] || '').trim();
          return (
            <div
              key={item.id}
              className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={
                    'h-1.5 w-1.5 shrink-0 rounded-full ' +
                    (value ? 'bg-emerald-400' : 'bg-zinc-700')
                  }
                />
                <span className="text-[11px] font-medium text-zinc-300">{item.label}</span>
              </div>
              <p
                className={
                  'mt-1 line-clamp-2 text-[11px] leading-relaxed ' +
                  (value ? 'text-zinc-400' : 'text-zinc-600')
                }
              >
                {value || '待补 · 默认「' + item.fallback.slice(0, 18) + '」'}
              </p>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-white/[0.06] p-3">
        <button
          type="button"
          onClick={onGenerate}
          disabled={busy}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-2.5 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {doc ? '重新生成文档' : '生成产品文档'}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!doc}
            className="flex items-center justify-center gap-1 rounded-lg border border-white/10 py-1.5 text-[11px] text-zinc-300 transition hover:border-white/20 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copied ? '已复制' : '复制 MD'}
          </button>
          <button
            type="button"
            onClick={() => doc && downloadMarkdown(safeFilename(doc.title), doc.markdown)}
            disabled={!doc}
            className="flex items-center justify-center gap-1 rounded-lg border border-white/10 py-1.5 text-[11px] text-zinc-300 transition hover:border-white/20 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Download className="h-3 w-3" />
            下载 .md
          </button>
        </div>
      </div>
    </aside>
  );
}
