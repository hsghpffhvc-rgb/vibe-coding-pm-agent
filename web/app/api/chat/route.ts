import { NextResponse } from 'next/server';
import { runEngine } from '@/lib/engine';
import { llmConfigured, runLlm } from '@/lib/llm';
import { loadAgentBrain } from '@/lib/system-prompt';
import type { EngineInput } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Document generation takes 25-40s, above the 10s serverless default.
export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({ engine: llmConfigured() ?? 'local', brain: loadAgentBrain().source });
}

export async function POST(request: Request) {
  let body: Partial<EngineInput> = {};
  try {
    body = (await request.json()) as Partial<EngineInput>;
  } catch {
    body = {};
  }

  const input: EngineInput = {
    messages: Array.isArray(body.messages) ? body.messages : [],
    brief: body.brief ?? {},
    answers: Array.isArray(body.answers) ? body.answers : [],
    intent: body.intent,
  };

  const brain = loadAgentBrain().source;
  const llm = await runLlm({
    messages: input.messages,
    brief: input.brief,
    answers: input.answers ?? [],
    intent: input.intent,
  });

  if (llm) {
    return NextResponse.json({
      blocks: llm.blocks,
      brief: { ...input.brief, ...llm.brief },
      engine: llmConfigured() ?? 'llm',
      brain,
      missing: [],
    });
  }

  const result = runEngine(input);
  // Small delay keeps the local engine feeling deliberate rather than instant
  await new Promise((resolve) => setTimeout(resolve, 320));
  return NextResponse.json({ ...result, brain });
}
