'use client';

import { AlertTriangle, Sparkles } from 'lucide-react';
import { BriefPanel } from '@/components/BriefPanel';
import { ChatThread } from '@/components/ChatThread';
import { Composer } from '@/components/Composer';
import { Sidebar } from '@/components/Sidebar';
import { DIMENSIONS } from '@/lib/interview';
import { useSession } from '@/lib/use-session';

export default function Page() {
  const { messages, brief, busy, engine, brain, error, ready, latestDoc, phase, send, reset } =
    useSession();

  const filled = DIMENSIONS.filter((item) => (brief[item.id] || '').trim()).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        phase={phase}
        engine={engine}
        brain={brain}
        filled={filled}
        total={DIMENSIONS.length}
        onReset={reset}
        onQuickStart={(text) => send(text)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/[0.06] bg-black/20 px-4 py-3 backdrop-blur xl:hidden">
          <div className="flex items-center gap-2">
            <img
              src="/pm-avatar.png"
              alt="产品专家头像"
              className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/15"
            />
            <span className="text-sm font-semibold text-zinc-100">产品专家 Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-zinc-400">
              {filled}/{DIMENSIONS.length}
            </span>
            <button
              type="button"
              onClick={() => send('按当前信息生成产品文档', [], 'generate')}
              disabled={busy}
              className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-2.5 py-1 text-[11px] font-medium text-white transition hover:opacity-90 disabled:opacity-40"
            >
              <Sparkles className="h-3 w-3" />
              {latestDoc ? '重新生成' : '生成文档'}
            </button>
          </div>
        </header>

        {error ? (
          <div className="flex items-center gap-2 border-b border-red-500/20 bg-red-500/[0.08] px-4 py-2 text-xs text-red-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            {error}
          </div>
        ) : null}

        {ready ? (
          <ChatThread
            messages={messages}
            busy={busy}
            onAnswer={(answers, summary) => send(summary, answers)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-breathe" />
              正在加载会话
            </div>
          </div>
        )}

        <Composer
          busy={busy || !ready}
          showExamples={messages.length <= 1}
          onSend={(text) => send(text)}
        />
      </main>

      <BriefPanel
        brief={brief}
        busy={busy}
        doc={latestDoc}
        onGenerate={() => send('按当前信息生成产品文档', [], 'generate')}
      />
    </div>
  );
}
