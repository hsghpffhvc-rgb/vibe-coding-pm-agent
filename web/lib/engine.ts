import { buildDoc } from './doc-generator';
import { BATCH_SIZE, DIMENSION_MAP, missingDimensions } from './interview';
import { messageText } from './types';
import type {
  Block,
  Brief,
  ChatMessage,
  DimensionId,
  Direction,
  EngineInput,
  EngineOutput,
} from './types';

const MAX_ROUNDS = 2;

function subjectOf(text: string): string {
  const cleaned = text
    .replace(/帮我|请|做一个|做个|设计一个|设计|开发|搭建|一个|一款|产品|工具|网站|网页|应用|demo/gi, '')
    .replace(/[，。,.!！?？：:]/g, '')
    .trim();
  return (cleaned || '这个产品').slice(0, 14).replace(/[\s·、]+$/, '');
}

function buildDirections(subject: string): Direction[] {
  const base = subject.replace(/[\s·]*AI$/i, '') || subject;
  return [
    {
      id: 'A',
      title: base + ' AI 工作台',
      line: '输入一句话，直接产出可交付结果',
      features: ['AI 生成', '结果详情', '一键导出'],
      diff: '以生成速度取胜，首屏就是输入框',
    },
    {
      id: 'B',
      title: base + ' 管理看板',
      line: '一屏掌握全部状态与进度',
      features: ['工作台看板', '详情页编辑', '数据可视化'],
      diff: '以掌控感取胜，首屏就是数据面板',
    },
    {
      id: 'C',
      title: base + ' 批量生成器',
      line: '模板加参数，批量产出统一格式',
      features: ['模板库', '参数面板', '批量导出'],
      diff: '以一致性取胜，适合重复交付场景',
    },
  ];
}

function extractFromText(text: string, brief: Brief): Brief {
  const out: Brief = {};

  if (!brief.platform) {
    if (/小程序|手机|移动端|mobile|app/i.test(text)) out.platform = '移动端 App 优先';
    else if (/桌面|desktop|客户端/i.test(text)) out.platform = '桌面客户端';
    else if (/web|网站|网页/i.test(text)) out.platform = 'Web 响应式，桌面优先';
  }

  if (!brief.ui && /深色|暗色|dark|玻璃|glass|渐变/i.test(text)) {
    out.ui = '深色玻璃拟态 + 紫青渐变';
  }

  if (!brief.tech) {
    if (/vue/i.test(text)) out.tech = 'Vue 3 + Vite + Tailwind';
    else if (/next|react/i.test(text)) out.tech = 'Next.js 14 + TypeScript + Tailwind + shadcn/ui';
  }

  if (!brief.name) {
    const quoted = text.match(/[「“"]([^」”"]{2,12})[」”"]/);
    if (quoted) out.name = quoted[1];
  }

  return out;
}

function recap(brief: Brief): string | null {
  const known = Object.entries(brief).filter(([, value]) => value && String(value).trim());
  if (known.length === 0) return null;
  const parts = known.slice(0, 5).map(([dim, value]) => {
    const text = String(value).trim();
    return DIMENSION_MAP[dim as DimensionId].label + '：' + (text.length > 16 ? text.slice(0, 16) + '…' : text);
  });
  return '已确认 ' + parts.join(' / ') + '。';
}

export function runEngine(input: EngineInput): EngineOutput {
  const messages = input.messages ?? [];
  const answers = input.answers ?? [];
  const brief: Brief = { ...input.brief };

  for (const answer of answers) {
    if (answer.value && answer.value.trim()) brief[answer.dim] = answer.value.trim();
  }

  const userMessages = messages.filter((message) => message.role === 'user');
  const lastUser = userMessages[userMessages.length - 1];
  const lastText = lastUser ? messageText(lastUser) : '';

  if (lastUser) Object.assign(brief, extractFromText(lastText, brief));

  const rounds = messages.filter(
    (message) => message.role === 'agent' && message.blocks.some((block) => block.kind === 'questions'),
  ).length;
  const missing = missingDimensions(brief);
  const hasDoc = messages.some(
    (message) => message.role === 'agent' && message.blocks.some((block) => block.kind === 'doc'),
  );

  const changed = Object.keys(brief).filter(
    (key) => brief[key as DimensionId] !== input.brief[key as DimensionId],
  );

  if (hasDoc && changed.length === 0 && input.intent !== 'generate') {
    return {
      blocks: [
        {
          kind: 'text',
          text: '已记录。需要改动时，直接说「把目标用户改成 …」或「改第 5 节的配色」，我会只改对应部分并重生成。',
        },
      ],
      brief,
      engine: 'local',
      missing,
    };
  }

  const shouldGenerate =
    input.intent === 'generate' || missing.length === 0 || rounds >= MAX_ROUNDS || hasDoc;

  if (shouldGenerate) {
    const assumed = missing;
    const doc = buildDoc(brief, assumed);
    const blocks: Block[] = [];

    if (hasDoc && changed.length > 0) {
      blocks.push({
        kind: 'text',
        text:
          '已按最新信息重生成。本次改动落在：' +
          changed.map((key) => DIMENSION_MAP[key as DimensionId].label).join('、') +
          '。',
      });
    } else {
      blocks.push({
        kind: 'text',
        text: '按当前信息生成了完整文档，共 8 节。可直接复制进 Cursor，或告诉我要改哪一节。',
      });
    }

    blocks.push({ kind: 'doc', title: doc.title, markdown: doc.markdown });

    if (assumed.length > 0) {
      blocks.push({
        kind: 'note',
        text:
          '以下维度用默认值补齐：' +
          assumed.map((dim) => DIMENSION_MAP[dim].label).join('、') +
          '。在右侧补上后重新生成即可覆盖。',
      });
    }

    return { blocks, brief, engine: 'local', missing: assumed };
  }

  const isFirstTurn = userMessages.length <= 1 && !brief.features;

  if (isFirstTurn && lastText.trim().length <= 40) {
    const subject = subjectOf(lastText);
    return {
      blocks: [
        {
          kind: 'text',
          text: '先收敛方向。下面是三个能在一屏内跑通的方向，选一个我再往下拆：',
        },
        { kind: 'directions', options: buildDirections(subject) },
      ],
      brief,
      engine: 'local',
      missing,
    };
  }

  const batch = missing.slice(0, BATCH_SIZE);
  const questions = batch.map((dim) => {
    const spec = DIMENSION_MAP[dim];
    return {
      dim,
      label: spec.label,
      probe: spec.probe,
      options: spec.options,
      multi: spec.multi,
    };
  });

  const blocks: Block[] = [];
  const head = recap(brief);
  if (head) blocks.push({ kind: 'text', text: head });

  blocks.push({
    kind: 'text',
    text:
      (rounds === 0 ? '还差 ' : '补最后一轮，还差 ') +
      missing.length +
      ' 项。下面是这一轮的问题，可以直接点选，也可以自己写：',
  });
  blocks.push({ kind: 'questions', questions });

  return { blocks, brief, engine: 'local', missing };
}

export function seedGreeting(): ChatMessage {
  return {
    id: 'seed-' + Date.now(),
    role: 'agent',
    blocks: [
      {
        kind: 'text',
        text: '我是你的产品专家。给我一句话想法，我会先收敛方向，再补 9 个关键维度，最后产出可直接粘进 Cursor 的 8 节产品文档。',
      },
      {
        kind: 'text',
        text: '不清楚怎么开始？点下方的示例，或者直接描述你想做的产品。',
      },
    ],
    createdAt: Date.now(),
  };
}
