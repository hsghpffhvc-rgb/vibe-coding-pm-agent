# 范例 · FlowDark 产品文档（黄金样本）

> 本文件是风格与颗粒度的基准。生成新文档时对齐这里的密度、字段与语气，不要对齐它的业务内容。

---

## 1. 项目概述

| 项 | 内容 |
| --- | --- |
| 产品名 | FlowDark |
| 一句话定位 | 把零散客户 brief 在 60 秒内变成提案、任务清单与报价 |
| 目标用户 | 独立设计师 / 撰稿人 / 独立开发者，22–35 岁，笔记本为主力设备 |
| 平台 | Web 响应式，桌面 1440px 优先 |
| 竞品参考 | Linear（侧栏与命令面板）+ Raycast（玻璃质感）+ Notion AI（右侧 AI 面板） |

**核心痛点**
1. brief 散落在邮件与聊天工具，汇总靠手工复制。
2. 撰写提案与报价平均耗时 2–3 小时，且格式每次重做。
3. 项目进度与收入分散在表格里，无法一眼看清。

**核心价值：** 一次粘贴替代 3 小时行政劳动，提案、任务、报价同时产出。

## 2. 用户与场景

| 项 | 内容 |
| --- | --- |
| 角色 | 独立接单者，同时推进 3–6 个项目 |
| 设备 | 桌面端 1440px，移动端仅查看看板 |
| 熟练度 | 熟练使用 Notion / Linear，不写代码 |

**主场景**
1. 触发：客户发来一段 brief，用户在 AI 面板粘贴。
2. 操作：选语气与预算区间 → 生成 → 微调 → 保存为项目。
3. 产出：可导出的 Markdown 提案 + 已拆解的任务看板。

**首屏第一画面：** 深色三栏工作台，中间 4 个 KPI 卡片与收入曲线，右侧 AI 面板已展开并显示上一次会话。

## 3. 功能规格

### F1 · Brief 转提案（路由 `/studio`）★
- **目标：** 粘贴一段文本，得到结构化提案。
- **交互流：**
  1. 在 textarea 粘贴 brief，右侧选语气（专业 / 亲和）与预算滑块。
  2. 点击「生成提案」，文本以 30ms/字流式输出。
  3. 输出含 Scope、Timeline 表、Quote 表、Next steps 四段。
  4. 点击「保存为项目」，跳转 `/projects/[id]`。
- **数据：** `brief: string`；`tone: 'pro' | 'friendly'`；`budget: [number, number]`；`proposal: { scope: string; timeline: Row[]; quote: Row[]; nextSteps: string[] }`
- **状态：** empty 显示示例 brief 一键填入；loading 打字机光标闪烁；error 保留输入并提示重试；success 显示四段结果与操作栏。
- **验收：** 粘贴任意 200 字以上文本，5 秒内产出四段完整结构。

### F2 · 工作台看板（路由 `/dashboard`）
- **目标：** 一屏掌握项目、收入、待办。
- **交互流：**
  1. 打开即见 4 个 KPI 卡片（Active、Revenue、Tasks Due、Credits）。
  2. 下方收入面积图随保存的项目自动刷新。
  3. 项目表格支持按状态筛选，点击行进入详情。
- **数据：** `projects: Project[]`；`revenueSeries: { month: string; value: number }[]`
- **状态：** empty 引导去 `/studio`；loading 用骨架卡片；error 顶部 banner；success 正常渲染。
- **验收：** 保存新项目后，KPI 与曲线数字同步变化。

### F3 · 项目详情（路由 `/projects/[id]`）
- **目标：** 在看板上推进任务。
- **交互流：**
  1. Tabs 切换 Overview / Tasks / Files。
  2. Tasks 三列看板，卡片可跨列拖拽，状态写回 store。
  3. 点击「AI 拆解」，把选中任务拆成 3–5 个子任务。
- **数据：** `tasks: { id: string; title: string; status: 'todo' | 'doing' | 'done' }[]`
- **状态：** empty 提示「还没有任务，试试 AI 拆解」；loading 骨架列；error 拖拽失败回滚；success 显示新位置。
- **验收：** 拖拽后刷新页面，任务仍在目标列。

### F4 · 命令面板（全局 `Cmd + K`）
- **目标：** 键盘直达任意页面与动作。
- **交互流：** `Cmd+K` 唤起 → 模糊搜索项目 → Enter 跳转；输入 `>` 切换为动作模式。
- **数据：** `commands: { id: string; label: string; run: () => void }[]`
- **状态：** empty 显示最近 3 项；loading 不适用；error 无结果时显示建议项；success 高亮当前项。
- **验收：** 输入任意项目名前 3 个字符即可命中。

**Out of scope：** 真实登录与账号体系、在线支付与发票开具、实时多人协作、文件上传与云存储。

## 4. 技术建议

```bash
npx create-next-app@latest flowdark --ts --tailwind --app
npm i zustand lucide-react recharts sonner && npx shadcn@latest init
```

**设计 Token**

| 变量 | 值 | 用途 |
| --- | --- | --- |
| `--bg` | `#09090B` | 页面底色 |
| `--surface` | `rgba(255,255,255,0.04)` | 卡片表面 |
| `--border` | `rgba(255,255,255,0.10)` | 卡片描边 |
| `--text` | `#FAFAFA` | 主文字 |
| `--muted` | `#A1A1AA` | 次文字 |
| `--primary` | `#8B5CF6` | 主色 |
| `--accent` | `#22D3EE` | 强调色 |
| `--radius` | `16px` | 卡片圆角 |
| `--blur` | `20px` | 玻璃模糊 |
| `--shadow` | `0 8px 30px rgba(0,0,0,.4)` | 悬浮阴影 |

**文件结构**

```
app/
  layout.tsx             # shell: sidebar + topbar + AI panel slot
  page.tsx               # landing
  dashboard/page.tsx
  studio/page.tsx
  projects/[id]/page.tsx
components/              # ui, ai-panel, kanban, command-palette
lib/
  mock-data.ts           # 6 projects, 2 revenue series
  ai.ts                  # generateProposalMock, useTypewriter
  store.ts               # zustand: projects, tasks, credits
```

**Mock-first：** `lib/ai.ts` 所有函数先返回本地 mock，首行保留 `// TODO: replace with real API`。

## 5. UI/UX 指导

- **背景：** `bg-[#09090B] text-zinc-100`，2 个固定径向渐变光斑（violet 左上、cyan 右下），透明度 ≤ 12%。
- **卡片：** `rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.4)]`。
- **侧栏：** `w-[240px] border-r border-white/5 bg-black/40 backdrop-blur`，导航项 `h-9 rounded-lg px-3 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-white/5`。
- **主按钮：** `bg-gradient-to-r from-violet-500 to-cyan-400 text-white rounded-xl px-4 h-10`。
- **栅格：** 侧栏 240 + 主区弹性 + AI 面板 360；间距 24px；内容最大宽 1280px。
- **四态：** 空状态 = lucide 图标 + 一句引导 + 主按钮；骨架 = `animate-pulse` 灰块；错误 = 红色 inline banner 保留输入；成功 = sonner toast 右上角。
- **动效：** 150–250ms ease-out，仅 hover、面板展开、toast、打字机光标；禁止循环动画。
- **响应式：** `<1024px` AI 面板收为右下悬浮按钮 + 抽屉；`<768px` 侧栏变底部 Tab。
- **图标：** lucide-react，16/20/24 三档，禁止 emoji。

## 6. 分步实现

**Step 0 · 初始化**
> `Create a Next.js 14 TypeScript App Router project named flowdark with Tailwind and shadcn/ui. Dark mode only, Inter font, path alias @/*.`

产出：工程骨架、全局 `bg-[#09090B]`
验收：`npm run dev` 打开深色空页，控制台无报错

**Step 1 · 应用外壳**
> `Build a dark glass app shell: fixed 240px left sidebar with logo and 5 nav items, topbar with Cmd+K search trigger and avatar, and two fixed radial gradient blobs behind content. Use lucide-react icons.`

产出：`app/layout.tsx`、`components/sidebar.tsx`、`components/topbar.tsx`
验收：三栏骨架在 1440px 与 768px 下均无横向滚动

**Step 2 · 工作台看板**
> `Build /dashboard with four KPI glass cards, a recharts AreaChart in dark theme using revenueSeries from lib/mock-data.ts, and a project table with status badges and row click navigation.`

产出：`app/dashboard/page.tsx`、`components/kpi-card.tsx`、`components/revenue-chart.tsx`
验收：6 条 mock 项目渲染完整，点击行跳转详情

**Step 3 · AI 提案逻辑**
> `Create lib/ai.ts exporting generateProposalMock(brief, tone, budget) that returns scope, timeline, quote, nextSteps, and a useTypewriter hook with 30ms per character. Add "// TODO: replace with real API" as the first line of the mock function.`

产出：`lib/ai.ts`、`hooks/use-typewriter.ts`
验收：调用 `generateProposalMock` 返回四段结构，打字机按 30ms 输出

**Step 4 · 提案工作台**
> `Build /studio with a brief textarea, tone toggle, budget range slider, a Generate button, and a streaming output panel rendering the four proposal sections with Copy, Save as project, and Export Markdown actions.`

产出：`app/studio/page.tsx`、`components/proposal-output.tsx`
验收：粘贴 brief 后 5 秒内出现四段结果，保存后出现在 `/dashboard`

**Step 5 · 项目详情与命令面板**
> `Build /projects/[id] with Overview, Tasks, Files tabs and a three-column kanban using native HTML5 drag events that writes back to the zustand store. Add a Cmd+K command palette with fuzzy search over projects and actions.`

产出：`app/projects/[id]/page.tsx`、`components/kanban.tsx`、`components/command-palette.tsx`
验收：拖拽后刷新仍保持列位置；Cmd+K 输入 3 字符即命中项目

**Step 6 · 打磨**
> `Add empty states, loading skeletons, sonner toasts, responsive breakpoints for the AI panel and sidebar, and a README containing a three-minute demo script.`

产出：四态组件、`README.md`
验收：`npm run build` 通过，控制台零报错

## 7. 验收与演示脚本

| 时间 | 动作 | 期望结果 |
| --- | --- | --- |
| 0:00 | 打开 `/dashboard` | 玻璃卡片与收入曲线立即呈现 |
| 0:40 | 进 `/studio`，粘贴 brief，点生成 | 提案四段流式出现 |
| 1:30 | 点「保存为项目」 | 跳转详情，看板新增项目 |
| 2:10 | 拖拽任务卡 + `Cmd+K` 跳转 | 位置保持，搜索命中 |
| 2:40 | 返回看板 | KPI 与曲线数字已更新 |

**硬性验收：** `npm run build` 通过；控制台零报错；首屏无布局跳动。

## 8. 假设与待确认项

| 维度 | 当前假设 | 影响范围 |
| --- | --- | --- |
| 目标用户 | 独立创作者，非团队协作 | F2 看板去掉成员列；Out of scope 排除协作 |
| 痛点优先级 | 以「提案耗时」为主价值 | F1 定为主角功能，其余为支撑 |
| 平台 | 桌面优先，移动端仅查看 | 5 节响应式断点规则 |
| AI 能力 | 本地 mock，不接真实模型 | `lib/ai.ts` 与 Step 3 |
| 竞品参考 | Linear + Raycast + Notion AI | 5 节布局与质感描述 |
