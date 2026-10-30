'use client';

import { ArrowRight, Layers } from 'lucide-react';
import type { Answer, Direction } from '@/lib/types';

interface DirectionCardsProps {
  options: Direction[];
  locked: boolean;
  disabled: boolean;
  onSelect: (answers: Answer[], summary: string) => void;
}

export function DirectionCards({ options, locked, disabled, onSelect }: DirectionCardsProps) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-3">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          disabled={locked || disabled}
          onClick={() =>
            onSelect(
              [
                { dim: 'features', value: option.features.join('、') },
                { dim: 'value', value: option.line },
              ],
              '选择方向 ' + option.id + '：' + option.title,
            )
          }
          className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-left transition hover:border-brand-500/50 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-zinc-400">
              方向 {option.id}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-600 transition group-hover:text-brand-400" />
          </div>
          <p className="mt-2 text-sm font-medium text-zinc-100">{option.title}</p>
          <p className="mt-1 text-xs text-zinc-500">{option.line}</p>
          <div className="mt-2.5 flex flex-wrap gap-1">
            {option.features.map((feature) => (
              <span
                key={feature}
                className="rounded border border-white/[0.08] px-1.5 py-0.5 text-[10px] text-zinc-400"
              >
                {feature}
              </span>
            ))}
          </div>
          <p className="mt-2.5 flex items-start gap-1 text-[11px] leading-relaxed text-zinc-600">
            <Layers className="mt-0.5 h-3 w-3 shrink-0" />
            {option.diff}
          </p>
        </button>
      ))}
    </div>
  );
}
