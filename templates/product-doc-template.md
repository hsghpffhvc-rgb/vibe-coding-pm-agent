# 产品文档模板（Cursor Demo 版）

> 复制本文件填充。删除所有 `<...>` 占位与注释行。正文控制在 1200–2000 字。

---

# <产品名> · 产品文档

## 1. 项目概述

| 项 | 内容 |
| --- | --- |
| 产品名 | <名称> |
| 一句话定位 | <把 X 在 N 秒内变成 Y> |
| 目标用户 | <角色，年龄段/规模，工作方式> |
| 平台 | <Web 响应式 / Mobile / Desktop> |
| 竞品参考 | <借鉴谁的那一部分> |

**核心痛点**
1. <可感知的具体损失>
2. <...>
3. <...>

**核心价值：** <一句话，含数字或对比>

## 2. 用户与场景

| 项 | 内容 |
| --- | --- |
| 角色 | <...> |
| 设备 | <桌面 1440px 优先 / 移动端> |
| 熟练度 | <...> |

**主场景**
1. 触发：<用户在什么状态下进入>
2. 操作：<关键 2–3 步>
3. 产出：<带走什么交付物>

**首屏第一画面：** <观众打开 demo 看到的内容>

## 3. 功能规格

### F1 · <名称>（路由 `<path>`）★
- **目标：** <一句话>
- **交互流：**
  1. <点击什么>
  2. <发生什么>
  3. <结果>
- **数据：** `<fieldName>: <type>` …
- **状态：** empty <...>；loading <...>；error <...>；success <...>
- **验收：** <可勾选的一条断言>

### F2 · <名称>（路由 `<path>`）
- **目标：**
- **交互流：**
- **数据：**
- **状态：**
- **验收：**

### F3 · <名称>（路由 `<path>`）
（同上，3–5 个为止）

**Out of scope：** <明确不做的能力，≥ 3 项>

## 4. 技术建议

```bash
npx create-next-app@latest <name> --ts --tailwind --app
# deps: shadcn/ui, zustand, lucide-react, recharts, sonner
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
  layout.tsx          # shell: sidebar + topbar
  page.tsx            # landing
  <route>/page.tsx    # 核心页面
components/           # ui 组件
lib/
  mock-data.ts        # all mock fixtures
  ai.ts               # AI logic, TODO: replace with real API
  store.ts            # zustand store
```

**Mock-first：** 所有 AI 调用先返回本地 mock，函数体首行留 `// TODO: replace with real API`。

## 5. UI/UX 指导

- **背景：** `bg-[#09090B] text-zinc-100` + 2 个固定径向渐变光斑。
- **卡片：** `rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl`。
- **侧栏：** `w-[240px] border-r border-white/5 bg-black/40 backdrop-blur`。
- **主按钮：** `bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl`。
- **栅格：** 12 栏，间距 24px，内容区最大宽 1280px。
- **四态：** 空状态含图标 + 一句引导 + 主按钮；骨架屏用 `animate-pulse`；错误用红色 inline banner；成功用 sonner toast。
- **动效：** 150–250ms ease-out，仅用于 hover / 面板展开 / toast。
- **响应式：** `<1024px` 收起右侧面板为悬浮按钮 + 抽屉；`<768px` 侧栏变底部导航。
- **图标：** lucide-react，尺寸 16/20/24，禁止 emoji。

## 6. 分步实现

**Step 0 · 初始化**
> `Create a Next.js 14 TypeScript App Router project with Tailwind and shadcn/ui. Dark mode only. Path alias @/*.`

产出：工程骨架
验收：`npm run dev` 打开空白深色页无报错

**Step 1 · 应用外壳**
> `...`

产出：
验收：

**Step 2 · <主角页面>**
> `...`

**Step 3 · <AI 逻辑>**
> `...`

**Step 4 · <其余页面>**
> `...`

**Step 5 · 打磨**
> `Add empty states, loading skeletons, sonner toasts, responsive breakpoints, and a README with a demo script.`

## 7. 验收与演示脚本

**3 分钟演示**
| 时间 | 动作 | 期望结果 |
| --- | --- | --- |
| 0:00 | <...> | <...> |
| 0:45 | <...> | <...> |
| 1:30 | <...> | <...> |
| 2:30 | <...> | <...> |

**硬性验收：** `npm run build` 通过；控制台零报错；首屏无布局跳动。

## 8. 假设与待确认项

| 维度 | 当前假设 | 影响范围 |
| --- | --- | --- |
| <维度> | <默认值> | <改它会动到哪一节> |
