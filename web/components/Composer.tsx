'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';

const EXAMPLES = [
  '做一个给自由职业者用的 AI 提案工具',
  '给咖啡店老板做一个库存预警工具',
  '帮我做一个独立开发者的更新日志生成器',
];

interface ComposerProps {
  busy: boolean;
  showExamples?: boolean;
  onSend: (text: string) => void;
}

export function Composer({ busy, showExamples = true, onSend }: ComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = Math.min(element.scrollHeight, 160) + 'px';
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || busy) return;
    onSend(text);
    setValue('');
  };

  return (
    <div className="border-t border-white/[0.06] bg-black/30 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 transition focus-within:border-brand-500/50 focus-within:shadow-glow">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="描述你的产品想法，或回答上面的问题…"
            className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-[13.5px] leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-600"
          />
          <button
            type="button"
            onClick={submit}
            disabled={busy || !value.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="发送"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>

        {showExamples ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-[11px] text-zinc-600">
              <Sparkles className="h-3 w-3" />
              试试
            </span>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                disabled={busy}
                onClick={() => onSend(example)}
                className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[11px] text-zinc-500 transition hover:border-white/20 hover:text-zinc-300 disabled:opacity-40"
              >
                {example}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-2 text-[10px] text-zinc-700">
            Enter 发送 · Shift+Enter 换行
          </div>
        )}
      </div>
    </div>
  );
}
