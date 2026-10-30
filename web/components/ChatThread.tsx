'use client';

import { useEffect, useRef } from 'react';
import { MessageBlocks } from './MessageBlocks';
import type { Answer, ChatMessage } from '@/lib/types';

interface ChatThreadProps {
  messages: ChatMessage[];
  busy: boolean;
  onAnswer: (answers: Answer[], summary: string) => void;
}

export function ChatThread({ messages, busy, onAnswer }: ChatThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          if (message.role === 'user') {
            return (
              <div key={message.id} className="flex justify-end animate-rise">
                <div className="max-w-[85%] rounded-2xl rounded-br-md border border-brand-500/25 bg-brand-500/[0.12] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-zinc-100">
                  <p className="whitespace-pre-wrap">{message.blocks.map((block) => (block.kind === 'text' ? block.text : '')).join('\n')}</p>
                </div>
              </div>
            );
          }

          return (
            <div key={message.id} className="animate-rise">
              <div className="mb-2 flex items-center gap-2">
                <img
                  src="/pm-avatar.png"
                  alt="产品专家头像"
                  className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-white/15"
                />
                <span className="text-xs font-medium text-zinc-400">产品专家</span>
              </div>
              <MessageBlocks
                blocks={message.blocks}
                locked={!isLast}
                disabled={busy}
                onAnswer={onAnswer}
              />
            </div>
          );
        })}

        {busy ? (
          <div className="animate-rise">
            <div className="mb-2 flex items-center gap-2">
              <img
                src="/pm-avatar.png"
                alt="产品专家头像"
                className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-white/15"
              />
              <span className="text-xs font-medium text-zinc-400">产品专家</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-breathe" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-breathe [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-breathe [animation-delay:300ms]" />
              <span className="ml-1.5 text-xs text-zinc-500">正在整理信息</span>
            </div>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>
    </div>
  );
}
