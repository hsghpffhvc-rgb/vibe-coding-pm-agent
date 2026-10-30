import { buildPayload, buildSystemPrompt } from './system-prompt';
import { messageText } from './types';
import type { Answer, Block, Brief, ChatMessage } from './types';

const DEFAULT_TIMEOUT_MS = 90000;

/** Reasoning models can burn a while before emitting any content. */
function timeoutMs(): number {
  return Number(process.env.OPENAI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
}

interface LlmRequest {
  messages: ChatMessage[];
  brief: Brief;
  answers: Answer[];
  intent?: string;
}

export interface LlmResponse {
  blocks: Block[];
  brief: Brief;
  engine: string;
}

function stripFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

function isBlock(value: unknown): value is Block {
  if (!value || typeof value !== 'object') return false;
  const kind = (value as { kind?: string }).kind;
  return kind === 'text' || kind === 'directions' || kind === 'questions' || kind === 'doc' || kind === 'note';
}

function sanitize(raw: unknown): LlmResponse | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as { blocks?: unknown; brief?: unknown };
  if (!Array.isArray(candidate.blocks)) return null;

  const blocks = candidate.blocks.filter(isBlock).filter((block) => {
    if (block.kind === 'text' || block.kind === 'note') return Boolean(block.text);
    if (block.kind === 'doc') return Boolean(block.markdown);
    if (block.kind === 'directions') return Array.isArray(block.options) && block.options.length > 0;
    return Array.isArray(block.questions) && block.questions.length > 0;
  });

  if (blocks.length === 0) return null;

  const brief =
    candidate.brief && typeof candidate.brief === 'object' ? (candidate.brief as Brief) : {};

  return { blocks, brief, engine: 'llm' };
}

function openAiBaseUrl(): string {
  return (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
}

function openAiModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

function buildRequestBody(payload: string): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: openAiModel(),
    temperature: 0.7,
    // Reasoning models spend tokens on reasoning_content before emitting content
    max_tokens: Number(process.env.OPENAI_MAX_TOKENS || 8192),
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: payload },
    ],
  };

  if (process.env.OPENAI_BASE_URL) {
    // DashScope-style gateways expose this; the OpenAI endpoint rejects unknown params.
    // With thinking off, the whole budget goes to the document instead of reasoning.
    body.enable_thinking = (process.env.OPENAI_ENABLE_THINKING || 'false') === 'true';
  }

  return body;
}

async function callOpenAi(apiKey: string, payload: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs());
  try {
    const response = await fetch(openAiBaseUrl() + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify(buildRequestBody(payload)),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error('openai-compatible ' + response.status + ' ' + detail.slice(0, 300));
    }
    const data = (await response.json()) as {
      choices?: { message?: { content?: string }; finish_reason?: string }[];
    };
    const choice = data.choices?.[0];
    const content = choice?.message?.content;
    if (!content || !content.trim()) {
      // Usually means the token budget was consumed by reasoning
      throw new Error('empty content, finish_reason=' + (choice?.finish_reason || 'unknown'));
    }
    if (choice?.finish_reason === 'length') {
      throw new Error(
        'output truncated at max_tokens, raise OPENAI_MAX_TOKENS (current ' + Number(process.env.OPENAI_MAX_TOKENS || 8192) + ')',
      );
    }
    return content;
  } finally {
    clearTimeout(timer);
  }
}

async function callAnthropic(apiKey: string, payload: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs());
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
        max_tokens: 4096,
        temperature: 0.7,
        system: buildSystemPrompt(),
        messages: [{ role: 'user', content: payload }],
      }),
    });
    if (!response.ok) throw new Error('anthropic ' + response.status);
    const data = (await response.json()) as { content?: { text?: string }[] };
    return data.content?.[0]?.text || '';
  } finally {
    clearTimeout(timer);
  }
}

/** Host of a custom OpenAI-compatible endpoint, for the UI engine label. */
function endpointLabel(): string | null {
  const base = process.env.OPENAI_BASE_URL;
  if (!base) return null;
  try {
    return new URL(base).host;
  } catch {
    return base.slice(0, 40);
  }
}

export function llmConfigured(): string | null {
  if (process.env.OPENAI_API_KEY) {
    const label = endpointLabel();
    return openAiModel() + (label ? ' · ' + label : ' · OpenAI');
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return 'Anthropic · ' + (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5');
  }
  return null;
}

export async function runLlm(request: LlmRequest): Promise<LlmResponse | null> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!openaiKey && !anthropicKey) return null;

  const payload = buildPayload({
    brief: request.brief,
    answers: request.answers,
    intent: request.intent,
    transcript: request.messages.map((message) => ({
      role: message.role,
      text: messageText(message),
    })),
  });

  try {
    const raw = openaiKey
      ? await callOpenAi(openaiKey, payload)
      : await callAnthropic(anthropicKey as string, payload);
    const parsed = JSON.parse(stripFence(raw));
    return sanitize(parsed);
  } catch (error) {
    console.log('[llm] fallback to local engine:', (error as Error).message);
    return null;
  }
}
