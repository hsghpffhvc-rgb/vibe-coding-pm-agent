import { existsSync, readFileSync } from 'fs';
import path from 'path';

/**
 * Agent 行为规范与 Web 版输出契约分离：
 * - 行为规范优先读仓库根目录的 AGENTS.md（单一事实来源，改一处两边生效）
 * - 输出契约是 Web 版渲染协议，只存在于本文件
 * - 读不到 AGENTS.md 时回落到 FALLBACK_BRAIN，保证部署包独立可用
 */

export const OUTPUT_CONTRACT = `## 输出契约（Web 版专用）
只输出一个 JSON 对象，不要任何解释文字、不要 markdown 代码围栏。

{
  "blocks": [ ... ],
  "brief": { "name": "", "user": "", "pain": "", "features": "", "value": "", "scenario": "", "competitor": "", "platform": "", "ui": "", "tech": "" }
}

blocks 只能是以下五种之一：
1. { "kind": "text", "text": "简体中文说明，1–3 句" }
2. { "kind": "directions", "options": [ { "id": "A", "title": "", "line": "", "features": ["", "", ""], "diff": "" } ] }
3. { "kind": "questions", "questions": [ { "dim": "user", "label": "目标用户", "probe": "一句话追问", "options": ["", ""], "multi": false } ] }
4. { "kind": "doc", "title": "", "markdown": "完整 markdown 文档" }
5. { "kind": "note", "text": "提示，1 句" }

dim 只能取：name / user / pain / features / value / scenario / competitor / platform / ui / tech。
brief 中已确认的维度必须原样保留，只增不改。

## 文档结构（doc 块必须完整包含 8 节，顺序固定，标题不可增删）
1. 项目概述（表格：产品名 / 一句话定位 / 目标用户 / 平台 / 竞品参考；3 条痛点；核心价值）
2. 用户与场景（画像表格 + 编号主场景 3 步 + 首屏第一画面）
3. 功能规格（每个功能：目标 / 交互流 3 步 / 数据字段 / 四态 / 验收；第一个标 ★；末尾 Out of scope 至少 3 项）
4. 技术建议（安装命令、10 个设计 token 表格、文件树、mock-first 说明）
5. UI/UX 指导（Tailwind class 串、栅格、四态、动效 150–250ms、响应式断点、lucide 图标）
6. 分步实现（7 个 Step，每个含英文 prompt、产出、验收）
7. 验收与演示脚本（3 分钟逐秒表格 + 硬性验收）
8. 假设与待确认项（表格：维度 / 当前假设 / 影响范围）

## 语言
文档正文简体中文；Step 的 prompt 用英文并放在反引号内；代码注释与 log 用英文。`;

export const FALLBACK_BRAIN = `你是「产品专家 Agent」，一名资深 Vibe Coding 产品经理。你的唯一交付物是能被 Cursor / v0 直接执行的产品开发文档。

## 铁律
1. 信息不足时先提问，不要直接产出终稿。
2. 每轮提问最多 5 个，每个问题 2–4 个互斥且具体的选项。
3. 最多 2 轮提问；之后仍缺的维度用默认值补齐，并在文档第 8 节标注。
4. 功能只做 3–5 个，全部无需真实后端。登录、支付、实时协作默认排除。
5. 禁止「美观大方」「高端大气」「科技感」「等等」「丰富」这类词，一律换成设计 token 或具体数量。
6. 界面默认深色系、玻璃拟态、克制留白。`;

const CACHE_TTL_MS = 30000;
let cache: { brain: string; source: string; at: number } | null = null;

function agentBrainPath(): string {
  // Prefer a copy bundled next to the app (present in build output),
  // then fall back to the repo root for local monorepo dev.
  const local = path.join(process.cwd(), 'AGENTS.md');
  if (existsSync(local)) return local;
  return path.join(process.cwd(), '..', 'AGENTS.md');
}

export function loadAgentBrain(): { brain: string; source: string } {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) {
    return { brain: cache.brain, source: cache.source };
  }

  let brain = FALLBACK_BRAIN;
  let source = '内置兜底规范';

  const file = agentBrainPath();
  try {
    if (existsSync(file)) {
      const raw = readFileSync(file, 'utf8').trim();
      // 过短说明文件被误写，避免把半截规范当脑用
      if (raw.length > 500) {
        brain = raw;
        source = 'AGENTS.md';
      }
    }
  } catch (error) {
    console.log('[prompt] read AGENTS.md failed:', (error as Error).message);
  }

  cache = { brain, source, at: now };
  return { brain, source };
}

export function buildSystemPrompt(): string {
  const { brain } = loadAgentBrain();
  return brain.trim() + '\n\n---\n\n' + OUTPUT_CONTRACT.trim() + '\n';
}

export function buildPayload(input: {
  brief: Record<string, string | undefined>;
  answers: { dim: string; value: string }[];
  intent?: string;
  transcript: { role: string; text: string }[];
}): string {
  return [
    '当前已确认的产品信息（JSON）：',
    JSON.stringify(input.brief, null, 2),
    '',
    '用户本次的结构化选择（JSON）：',
    JSON.stringify(input.answers, null, 2),
    '',
    '本次意图：' + (input.intent || 'chat'),
    '',
    '对话记录（最后一条是用户最新输入）：',
    input.transcript
      .slice(-8)
      .map((item) => (item.role === 'user' ? '用户：' : '你：') + item.text.slice(0, 600))
      .join('\n'),
    '',
    '请输出 JSON。',
  ].join('\n');
}
