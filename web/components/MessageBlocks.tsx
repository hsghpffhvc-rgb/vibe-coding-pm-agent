'use client';

import { Info } from 'lucide-react';
import { DocCard } from './DocCard';
import { DirectionCards } from './DirectionCards';
import { QuestionCard } from './QuestionCard';
import { Markdown } from './Markdown';
import type { Answer, Block } from '@/lib/types';

interface MessageBlocksProps {
  blocks: Block[];
  locked: boolean;
  disabled: boolean;
  onAnswer: (answers: Answer[], summary: string) => void;
}

export function MessageBlocks({ blocks, locked, disabled, onAnswer }: MessageBlocksProps) {
  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (block.kind === 'text') {
          return (
            <div key={index} className="text-[13.5px] leading-relaxed text-zinc-300">
              <Markdown>{block.text}</Markdown>
            </div>
          );
        }
        if (block.kind === 'note') {
          return (
            <div
              key={index}
              className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-xs leading-relaxed text-amber-200/90"
            >
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{block.text}</span>
            </div>
          );
        }
        if (block.kind === 'directions') {
          return (
            <DirectionCards
              key={index}
              options={block.options}
              locked={locked}
              disabled={disabled}
              onSelect={onAnswer}
            />
          );
        }
        if (block.kind === 'questions') {
          return (
            <QuestionCard
              key={index}
              questions={block.questions}
              locked={locked}
              disabled={disabled}
              onSubmit={onAnswer}
            />
          );
        }
        return <DocCard key={index} title={block.title} markdown={block.markdown} />;
      })}
    </div>
  );
}
