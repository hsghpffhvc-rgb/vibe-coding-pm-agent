# 产品专家 Agent · Web 版

把这个 Agent 做成了一个可直接使用的深色玻璃工作台：左边流程状态、中间对话采集、右边实时产品简报，聊完自动产出 8 节产品文档。

## 启动

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 生产构建
```

未配置密钥时走内置的本地引擎（确定性规则 + 模板生成），打开即用。当前仓库已接好 `deepseek-v4.1-flash`（见 `.env.local`）。

## 双引擎

| 引擎 | 触发条件 | 行为 |
| --- | --- | --- |
| 本地引擎 | 未配置任何 Key | 规则驱动：Phase 0 三方向 → 每轮 ≤5 问、≤2 轮 → 模板化生成 8 节文档 |
| 模型驱动 | 配置 `OPENAI_API_KEY`（可指向任意 OpenAI 兼容网关）或 `ANTHROPIC_API_KEY` | 调用模型生成，严格按 JSON 契约返回结构化 blocks；失败自动回落到本地引擎 |

```bash
cp .env.example .env.local
# 填入 OPENAI_API_KEY（以及可选的 OPENAI_BASE_URL / OPENAI_MODEL）
```

侧栏底部两行分别显示当前生效的**引擎**与**规范来源**，用于确认配置是否生效。

### 规范来源（单一事实来源）

模型引擎的 system prompt = 仓库根目录 `AGENTS.md` 全文 + `lib/system-prompt.ts` 里的 Web 版输出契约：

```87:90:web/lib/system-prompt.ts
export function buildSystemPrompt(): string {
  const { brain } = loadAgentBrain();
  return brain.trim() + '\n\n---\n\n' + OUTPUT_CONTRACT.trim() + '\n';
}
```

- 读取路径 `path.join(process.cwd(), '..', 'AGENTS.md')`，缓存 30 秒，改完 `AGENTS.md` 半分钟内生效，无需重启。
- 文件短于 500 字符视为损坏，回落到 `FALLBACK_BRAIN`（内置兜底规范），保证部署包独立可用。
- 规范来源只改根目录 `AGENTS.md` 即可，本地引擎的提问与文档结构无需同步改。
- `web/lib/` 里只保留 Web 版专属协议（block 结构、8 节文档模板、维度定义），不重复描述工作流。

### 接入任意 OpenAI 兼容网关

模型引擎指向任何 OpenAI 兼容端点（阿里云百炼 / DeepSeek / OpenRouter / vLLM 等），改三个环境变量：

```bash
OPENAI_API_KEY=...
OPENAI_BASE_URL=https://maas.qianwenaiapi.com/compatible-mode/v1
OPENAI_MODEL=deepseek-v4.1-flash
```

当前默认接通的是 `deepseek-v4.1-flash`。三个容易踩的坑：

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 返回 200 但 `content` 为空、`finish_reason=length` | 推理模型把 token 预算花在 `reasoning_content` 上 | `OPENAI_ENABLE_THINKING=false`，把预算全留给正文 |
| 生成的 JSON 被截断，回落本地引擎 | `max_tokens` 不够正文 + 推理 | 调大 `OPENAI_MAX_TOKENS`（默认 8192） |
| 请求超时 | 推理链较长 | 调大 `OPENAI_TIMEOUT_MS`（默认 120000） |

`enable_thinking` 参数只在该网关需要时才发送 —— 设置了 `OPENAI_BASE_URL` 才带上，避免 OpenAI 官方端点因未知参数报 400。

> `.env.local` 已在 `.gitignore` 中，密钥不会进版本库。换 key 或换模型只改这个文件，然后重启 dev server。

## 交互流程

1. 输入一句话想法 → 返回 3 个可选方向
2. 选方向 → 填充功能与价值，进入维度采集
3. 每轮最多 5 个问题，点选项或直接输入，可多选
4. 两轮后自动产出文档；也可随时点「生成产品文档」提前生成
5. 已生成后继续对话，改了维度就重生成，并提示改动落在哪一节

右侧简报实时显示 10 个字段的填充状态，未填的会标注默认值；文档第 8 节同步列出这些假设与影响范围。

## 目录

```
app/
  layout.tsx            # 深色底 + 渐变光斑
  page.tsx              # 三栏工作台
  icon.png              # 浏览器标签页图标（产品专家头像）
  api/chat/route.ts     # 引擎调度：先试 LLM，失败回落本地
public/
  pm-avatar.png         # 产品专家头像（256px 方图，CSS 圆形裁剪）
components/
  Sidebar.tsx           # 品牌、流程状态、采集进度、快速开始
  ChatThread.tsx        # 消息流 + 思考动效
  MessageBlocks.tsx     # block 分发渲染
  QuestionCard.tsx      # 结构化提问卡（选项 + 多选 + 自定义输入）
  DirectionCards.tsx    # Phase 0 三方向卡
  DocCard.tsx           # 文档卡：复制 / 下载 / 折叠
  BriefPanel.tsx        # 产品简报与导出
  Composer.tsx          # 输入框
lib/
  interview.ts          # 10 个维度、选项库、默认值、缺项判定
  engine.ts             # 本地引擎：阶段判定、批次提问、重生成
  doc-generator.ts      # 8 节文档模板生成
  llm.ts                # OpenAI / Anthropic 调用与结果校验
  system-prompt.ts      # 模型引擎的角色与 JSON 输出契约
  use-session.ts        # 会话状态 + localStorage 持久化
  export.ts             # 复制与下载工具
```

## 关键约定

- 面向用户的文案简体中文，代码注释与 log 英文，给 Cursor 的 Step prompt 英文。
- 文档结构固定 8 节，与仓库根目录 `templates/product-doc-template.md` 一致。
- 采集规则（≤5 问 / 轮、≤2 轮、默认值兜底）来自根目录 `AGENTS.md` 第 2、3 节。

## 部署

`npm run build` 会先跑 `scripts/sync-brain.mjs`，把根目录 `AGENTS.md` 复制到 `web/AGENTS.md`，再由 `next.config.mjs` 的 `outputFileTracingIncludes` 打进 server bundle —— 这一步是必须的，否则线上读不到规范会静默回落到 FALLBACK_BRAIN，文档从 8 节掉到 6 节、Step 从 7 个掉到 5 个，且技术栈会从 Next.js 漂到 Vite（已实测）。

Vercel 部署要点：

| 项 | 值 |
| --- | --- |
| Root Directory | `web` |
| Framework | Next.js（自动识别） |
| Build Command | `npm run build`（默认即可，里面已含 sync-brain） |
| 环境变量 | `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL` / `OPENAI_ENABLE_THINKING=false` |
| 函数超时 | `app/api/chat/route.ts` 已设 `maxDuration = 60`（文档生成 24–40s） |

`.env.local` 不进版本库，环境变量在平台后台单独配。Hobby 计划函数上限 60s，若网关波动导致超时，换 Pro（300s）或改用自带服务器的方案（Railway / Fly.io / 自建 VPS），后者不受这个限制。

## 改动入口

| 想改什么 | 改哪里 |
| --- | --- |
| 维度、选项、默认值 | `lib/interview.ts` |
| 提问轮次与阶段判定 | `lib/engine.ts` 的 `MAX_ROUNDS` / `BATCH_SIZE` |
| 文档章节与模板 | `lib/doc-generator.ts` |
| 模型引擎行为 | `lib/system-prompt.ts` |
| 视觉风格 | `app/globals.css` 与 `tailwind.config.ts` |

注意：`lib/*` 的规则改动，若希望 Cursor 版本也保持一致，请同步更新仓库根目录的 `AGENTS.md`。
