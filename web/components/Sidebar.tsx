'use client';

import { Check, Circle, Plus, Terminal, Wand2 } from 'lucide-react';
import type { Phase } from '@/lib/use-session';

interface SidebarProps {
  phase: Phase;
  engine: string;
  brain: string;
  filled: number;
  total: number;
  onReset: () => void;
  onQuickStart: (text: string) => void;
}

const STEPS: { key: Phase; label: string; hint: string }[] = [
  { key: 'intake', label: '收敛方向', hint: '一句话想法 → 3 个方向' },
  { key: 'clarify', label: '补齐维度', hint: '9 个维度，最多 2 轮' },
  { key: 'done', label: '生成文档', hint: '8 节结构，直接可用' },
];

const QUICK = [
  '自由职业者的 AI 提案工具',
  '咖啡店库存预警',
  '独立开发者更新日志生成器',
];

export function Sidebar({ phase, engine, brain, filled, total, onReset, onQuickStart }: SidebarProps) {
  const activeIndex = STEPS.findIndex((step) => step.key === phase);

  return (
    <aside className="hidden w-[248px] shrink-0 flex-col border-r border-white/[0.06] bg-black/40 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <img
          src="/pm-avatar.png"
          alt="产品专家头像"
          className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/15 shadow-glow"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-100">产品专家 Agent</p>
          <p className="truncate text-[11px] text-zinc-500">Vibe Coding PM</p>
        </div>
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.07]"
        >
          <Plus className="h-3.5 w-3.5" />
          新建会话
        </button>
      </div>

      <div className="mt-5 px-4">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600">流程</p>
        <ol className="mt-2 space-y-2.5">
          {STEPS.map((step, index) => {
            const done = index < activeIndex;
            const active = index === activeIndex;
            return (
              <li key={step.key} className="flex items-start gap-2">
                <span className="mt-0.5">
                  {done ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : active ? (
                    <span className="block h-3.5 w-3.5 rounded-full border-2 border-brand-400" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-zinc-700" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className={'text-xs ' + (active ? 'text-zinc-100' : done ? 'text-zinc-400' : 'text-zinc-600')}>
                    {step.label}
                  </p>
                  <p className="truncate text-[10px] text-zinc-600">{step.hint}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-5 px-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">采集进度</p>
          <span className="text-[10px] text-zinc-500">
            {filled}/{total}
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300"
            style={{ width: Math.round((filled / total) * 100) + '%' }}
          />
        </div>
      </div>

      <div className="mt-5 flex-1 px-4">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600">快速开始</p>
        <div className="mt-2 space-y-1">
          {QUICK.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onQuickStart(item)}
              className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-300"
            >
              <Wand2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{item}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <Terminal className="h-3 w-3" />
          <span className="truncate">
            {engine === 'local' ? '本地引擎 · 无需 API Key' : engine}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-600">
          <Check className="h-3 w-3 text-emerald-500/70" />
          <span className="truncate" title={brain === 'AGENTS.md' ? '模型引擎使用仓库根目录的 AGENTS.md 全文' : brain}>
            规范来源：{brain}
          </span>
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-zinc-700">
          设置 OPENAI_API_KEY 或 ANTHROPIC_API_KEY 可切换为模型驱动。
        </p>
      </div>
    </aside>
  );
}
