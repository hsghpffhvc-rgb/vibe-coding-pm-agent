export type DimensionId =
  | 'name'
  | 'user'
  | 'pain'
  | 'features'
  | 'value'
  | 'scenario'
  | 'competitor'
  | 'platform'
  | 'ui'
  | 'tech';

export type Brief = Partial<Record<DimensionId, string>>;

export interface Direction {
  id: string;
  title: string;
  line: string;
  features: string[];
  diff: string;
}

export interface Question {
  dim: DimensionId;
  label: string;
  probe: string;
  options: string[];
  multi: boolean;
}

export type Block =
  | { kind: 'text'; text: string }
  | { kind: 'directions'; options: Direction[] }
  | { kind: 'questions'; questions: Question[] }
  | { kind: 'doc'; title: string; markdown: string }
  | { kind: 'note'; text: string };

export interface ChatMessage {
  id: string;
  role: 'agent' | 'user';
  blocks: Block[];
  createdAt: number;
}

export interface Answer {
  dim: DimensionId;
  value: string;
}

export interface EngineInput {
  messages: ChatMessage[];
  brief: Brief;
  answers?: Answer[];
  intent?: 'chat' | 'generate';
}

export interface EngineOutput {
  blocks: Block[];
  brief: Brief;
  engine: string;
  missing: DimensionId[];
}

export function blockText(block: Block): string {
  if (block.kind === 'text' || block.kind === 'note') return block.text;
  if (block.kind === 'doc') return block.markdown;
  return '';
}

export function messageText(message: ChatMessage): string {
  return message.blocks.map(blockText).filter(Boolean).join('\n');
}
