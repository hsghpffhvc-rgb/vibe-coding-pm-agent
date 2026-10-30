'use client';

import { useMemo, useState } from 'react';
import { Check, CornerDownLeft } from 'lucide-react';
import type { Answer, Question } from '@/lib/types';

interface QuestionCardProps {
  questions: Question[];
  locked: boolean;
  disabled: boolean;
  onSubmit: (answers: Answer[], summary: string) => void;
}

export function QuestionCard({ questions, locked, disabled, onSubmit }: QuestionCardProps) {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [custom, setCustom] = useState<Record<string, string>>({});

  const answers = useMemo<Answer[]>(() => {
    return questions
      .map((question) => {
        const manual = (custom[question.dim] || '').trim();
        const picked = (selected[question.dim] || []).join('、');
        const value = manual || picked;
        return value ? { dim: question.dim, value } : null;
      })
      .filter((item): item is Answer => item !== null);
  }, [questions, selected, custom]);

  const toggle = (question: Question, option: string) => {
    if (locked || disabled) return;
    setSelected((prev) => {
      const current = prev[question.dim] || [];
      const exists = current.includes(option);
      const next = question.multi
        ? exists
          ? current.filter((item) => item !== option)
          : [...current, option]
        : [option];
      return { ...prev, [question.dim]: next };
    });
    setCustom((prev) => ({ ...prev, [question.dim]: '' }));
  };

  const submit = () => {
    if (answers.length === 0 || locked || disabled) return;
    const summary = questions
      .map((question) => {
        const answer = answers.find((item) => item.dim === question.dim);
        return answer ? question.label + '：' + answer.value : null;
      })
      .filter(Boolean)
      .join('；');
    onSubmit(answers, summary);
  };

  if (locked) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs text-zinc-500">
        本轮问题已回答
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-glass">
      <div className="space-y-4">
        {questions.map((question) => {
          const picked = selected[question.dim] || [];
          return (
            <div key={question.dim}>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-zinc-100">{question.label}</span>
                {question.multi ? (
                  <span className="rounded-full bg-brand-500/15 px-1.5 py-0.5 text-[10px] text-brand-400">
                    可多选
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-zinc-500">{question.probe}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {question.options.map((option) => {
                  const active = picked.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggle(question, option)}
                      className={
                        'rounded-lg border px-2.5 py-1.5 text-left text-xs transition ' +
                        (active
                          ? 'border-brand-500/60 bg-brand-500/15 text-zinc-100'
                          : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-200')
                      }
                    >
                      <span className="flex items-center gap-1.5">
                        {active ? <Check className="h-3 w-3 text-brand-400" /> : null}
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
              <input
                value={custom[question.dim] || ''}
                onChange={(event) => {
                  const value = event.target.value;
                  setCustom((prev) => ({ ...prev, [question.dim]: value }));
                  if (value.trim()) setSelected((prev) => ({ ...prev, [question.dim]: [] }));
                }}
                disabled={disabled}
                placeholder="或直接输入你的答案"
                className="mt-2 w-full rounded-lg border border-white/[0.08] bg-black/30 px-2.5 py-1.5 text-xs text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-brand-500/50"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <span className="text-[11px] text-zinc-500">
          已填 {answers.length}/{questions.length}
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={answers.length === 0 || disabled}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          提交回答
          <CornerDownLeft className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
