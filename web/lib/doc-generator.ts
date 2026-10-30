import { DIMENSION_MAP, splitValues } from './interview';
import type { Brief, DimensionId } from './types';

const FEATURE_ROUTES = ['/workspace', '/board', '/items/[id]', '/insights', '/export'];

function routeFor(feature: string, index: number): string {
  if (/看板|列表|管理/.test(feature)) return '/board';
  if (/详情|编辑/.test(feature)) return '/items/[id]';
  if (/图表|可视化|趋势/.test(feature)) return '/insights';
  if (/导出|分享/.test(feature)) return '/export';
  if (/生成|ai/i.test(feature)) return '/workspace';
  return FEATURE_ROUTES[index] || '/settings';
}

const IMPACT: Record<DimensionId, string> = {
  name: '标题、技术栈命令、文件树目录名',
  user: '第 2 节用户画像、第 3 节功能取舍',
  pain: '第 1 节痛点、第 3 节主角功能',
  features: '第 3 节功能规格、第 6 节实现步骤',
  value: '第 1 节定位、第 7 节演示脚本',
  scenario: '第 2 节主场景、第 7 节演示脚本',
  competitor: '第 1 节竞品参考、第 5 节布局与质感',
  platform: '第 2 节设备、第 5 节响应式断点',
  ui: '第 4 节设计 token、第 5 节 UI 指导',
  tech: '第 4 节技术栈、第 6 节全部 Step',
};

function pick(value: string | undefined, fallback: string): string {
  const trimmed = (value || '').trim();
  return trimmed || fallback;
}

function toList(value: string | undefined, fallback: string[], max: number): string[] {
  const parsed = value ? splitValues(value) : [];
  const merged = [...parsed, ...fallback.filter((item) => !parsed.includes(item))];
  return merged.slice(0, max);
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'demo-app';
}

function featureFlow(feature: string, route: string): string[] {
  if (/生成|ai/i.test(feature)) {
    return [
      '进入 ' + route + '，首屏即为输入区，下方固定主按钮「生成」。',
      '填写或粘贴输入内容，可切换语气与参数，点击「生成」。',
      '结果区以流式方式呈现，附带「复制」「保存」「导出」三个动作。',
    ];
  }
  if (/看板|列表|管理/.test(feature)) {
    return [
      '进入 ' + route + '，顶部为状态筛选条与搜索框。',
      '列表按更新时间倒序渲染，点击行进入详情，hover 显示快捷操作。',
      '新增一条记录后列表即时刷新，空状态引导去创建。',
    ];
  }
  if (/详情|编辑/.test(feature)) {
    return [
      '从列表点击进入 ' + route + '，左侧为内容主体，右侧为元信息。',
      '字段可直接编辑，失焦自动保存并显示「已保存」提示。',
      '顶部提供返回、复制链接与删除三个动作。',
    ];
  }
  if (/图表|可视化|趋势/.test(feature)) {
    return [
      '进入 ' + route + '，首屏渲染折线或面积图，默认近 6 个月。',
      '顶部可切换时间范围，hover 显示数值浮层。',
      '数据随主流程产生的新记录同步刷新。',
    ];
  }
  if (/导出|分享/.test(feature)) {
    return [
      '在结果区点击「导出」，弹出格式选择（Markdown / PDF / 图片）。',
      '选择后触发本地生成，按钮进入 loading 态。',
      '完成后弹出 toast，并提供下载链接。',
    ];
  }
  return [
    '进入 ' + route + '，首屏展示核心操作区与主按钮。',
    '完成一次输入后点击主按钮，等待结果返回。',
    '结果可查看、可复制，并同步到其他页面。',
  ];
}

function featureData(feature: string): string {
  if (/生成|ai/i.test(feature)) {
    return '`input: string`；`tone: string`；`result: Result[]`；`createdAt: number`';
  }
  if (/看板|列表|管理/.test(feature)) {
    return '`items: Item[]`；`status: "todo" | "doing" | "done"`；`updatedAt: number`';
  }
  if (/详情|编辑/.test(feature)) {
    return '`item: Item`；`fields: Record<string, string>`；`savedAt: number`';
  }
  if (/图表|可视化|趋势/.test(feature)) {
    return '`series: { label: string; value: number }[]`；`range: "1m" | "6m" | "1y"`';
  }
  return '`id: string`；`payload: Record<string, unknown>`；`createdAt: number`';
}

function featureAcceptance(feature: string): string {
  if (/生成|ai/i.test(feature)) return '粘贴任意 200 字以上输入，3 秒内产出完整结构化结果且可一键复制。';
  if (/看板|列表|管理/.test(feature)) return '新增一条记录后刷新页面，记录仍在且排序正确。';
  if (/详情|编辑/.test(feature)) return '修改任一字段并失焦，刷新后内容保持修改后的值。';
  if (/图表|可视化|趋势/.test(feature)) return '切换时间范围后图表重绘，无控制台报错。';
  return '完成一次完整主流程，中途无阻断性报错。';
}

export function buildDoc(brief: Brief, assumed: DimensionId[]): { title: string; markdown: string } {
  const name = pick(brief.name, 'NovaFlow');
  const users = pick(brief.user, '独立创作者与 1–5 人小团队，桌面端为主，不写代码');
  const pains = toList(
    brief.pain,
    ['重复劳动多，每次都要重做一遍', '信息分散在多个工具里，汇总靠手工', '进度不可见，无法一眼掌握'],
    3,
  );
  const features = toList(brief.features, ['AI 生成', '工作台看板', '结果详情', '一键导出'], 5);
  const value = pick(brief.value, '把 3 小时手工劳动压缩成 60 秒');
  const scenario = pick(brief.scenario, '收到输入 → 处理 → 产出交付物');
  const competitor = pick(brief.competitor, 'Linear（布局）+ Raycast（质感）+ Notion AI（AI 面板）');
  const platform = pick(brief.platform, 'Web 响应式，桌面 1440px 优先');
  const ui = pick(brief.ui, '深色玻璃拟态 + 紫青渐变，克制留白');
  const tech = pick(brief.tech, 'Next.js 14 + TypeScript + Tailwind + shadcn/ui + zustand');
  const appSlug = slug(name);
  const isMobile = /移动|app|手机/i.test(platform);

  const lines: string[] = [];

  lines.push('# ' + name + ' · 产品文档');
  lines.push('');

  // 1. Overview
  lines.push('## 1. 项目概述');
  lines.push('');
  lines.push('| 项 | 内容 |');
  lines.push('| --- | --- |');
  lines.push('| 产品名 | ' + name + ' |');
  lines.push('| 一句话定位 | ' + value + ' |');
  lines.push('| 目标用户 | ' + users + ' |');
  lines.push('| 平台 | ' + platform + ' |');
  lines.push('| 竞品参考 | ' + competitor + ' |');
  lines.push('');
  lines.push('**核心痛点**');
  pains.forEach((pain, index) => lines.push(index + 1 + '. ' + pain));
  lines.push('');
  lines.push('**核心价值：** ' + value + '。');
  lines.push('');

  // 2. Users and scenario
  lines.push('## 2. 用户与场景');
  lines.push('');
  lines.push('| 项 | 内容 |');
  lines.push('| --- | --- |');
  lines.push('| 角色 | ' + users + ' |');
  lines.push('| 设备 | ' + (isMobile ? '移动端优先，375px 起' : '桌面 1440px 优先，移动端仅查看') + ' |');
  lines.push('| 熟练度 | 不写代码，习惯使用现成工具，容忍 1 次学习成本 |');
  lines.push('');
  lines.push('**主场景**');
  lines.push('');
  lines.push('1. 触发：' + scenario.split(/[→>]/)[0].trim() + '。');
  lines.push('2. 操作：在主界面完成一次核心输入，点击主按钮得到结果。');
  lines.push('3. 产出：结果可复制、可导出，并沉淀到列表与看板中。');
  lines.push('');
  lines.push('**首屏第一画面：** 打开 ' + name + ' 立即看到核心操作区与最近 3 条记录，右侧或下方展示当前进度摘要。');
  lines.push('');

  // 3. Feature spec
  lines.push('## 3. 功能规格');
  lines.push('');
  features.forEach((feature, index) => {
    const route = routeFor(feature, index);
    const star = index === 0 ? ' ★' : '';
    const flow = featureFlow(feature, route);
    lines.push('### F' + (index + 1) + ' · ' + feature + '（路由 `' + route + '`）' + star);
    lines.push('');
    lines.push('- **目标：** 在 `' + route + '` 跑通「' + feature + '」的完整路径，一次操作产出可用结果。');
    lines.push('- **交互流：**');
    flow.forEach((step, stepIndex) => lines.push('  ' + (stepIndex + 1) + '. ' + step));
    lines.push('- **数据：** ' + featureData(feature));
    lines.push('- **状态：** empty 显示图标 + 一句引导 + 主按钮；loading 骨架屏占位；error 保留输入并提示重试；success 渲染结果与操作栏。');
    lines.push('- **验收：** ' + featureAcceptance(feature));
    lines.push('');
  });
  lines.push('**Out of scope：** 真实登录与账号体系、在线支付与开票、实时多人协作、文件上传与云存储。');
  lines.push('');

  // 4. Tech
  lines.push('## 4. 技术建议');
  lines.push('');
  lines.push('```bash');
  if (/vue/i.test(tech)) {
    lines.push('npm create vite@latest ' + appSlug + ' -- --template vue-ts');
  } else if (/单文件|html/i.test(tech)) {
    lines.push('# no build step, single index.html');
  } else {
    lines.push('npx create-next-app@latest ' + appSlug + ' --ts --tailwind --app');
  }
  lines.push('```');
  lines.push('');
  lines.push('**技术栈：** ' + tech + '。');
  lines.push('');
  lines.push('**设计 Token**');
  lines.push('');
  lines.push('| 变量 | 值 | 用途 |');
  lines.push('| --- | --- | --- |');
  lines.push('| `--bg` | `#09090B` | 页面底色 |');
  lines.push('| `--surface` | `rgba(255,255,255,0.04)` | 卡片表面 |');
  lines.push('| `--border` | `rgba(255,255,255,0.10)` | 卡片描边 |');
  lines.push('| `--text` | `#FAFAFA` | 主文字 |');
  lines.push('| `--muted` | `#A1A1AA` | 次文字 |');
  lines.push('| `--primary` | `#8B5CF6` | 主色 |');
  lines.push('| `--accent` | `#22D3EE` | 强调色 |');
  lines.push('| `--radius` | `16px` | 卡片圆角 |');
  lines.push('| `--blur` | `20px` | 玻璃模糊 |');
  lines.push('| `--shadow` | `0 8px 30px rgba(0,0,0,.4)` | 悬浮阴影 |');
  lines.push('');
  lines.push('**文件结构**');
  lines.push('');
  lines.push('```');
  lines.push('app/');
  lines.push('  layout.tsx          # shell: sidebar + topbar');
  lines.push('  page.tsx            # main workspace');
  lines.push('  ' + FEATURE_ROUTES[0].replace(/^\//, '').replace(/\[|\]/g, '') + '/page.tsx');
  lines.push('components/           # ui, feature panels');
  lines.push('lib/');
  lines.push('  mock-data.ts        # all mock fixtures');
  lines.push('  ai.ts               # AI logic, TODO: replace with real API');
  lines.push('  store.ts            # zustand store');
  lines.push('```');
  lines.push('');
  lines.push('**Mock-first：** 所有 AI 调用先返回本地 mock，函数体首行保留 `// TODO: replace with real API`。');
  lines.push('');

  // 5. UI/UX
  lines.push('## 5. UI/UX 指导');
  lines.push('');
  lines.push('- **风格：** ' + ui + '。');
  lines.push('- **背景：** `bg-[#09090B] text-zinc-100`，2 个固定径向渐变光斑，透明度 ≤ 12%。');
  lines.push('- **卡片：** `rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.4)]`。');
  lines.push('- **侧栏：** `w-[240px] border-r border-white/5 bg-black/40 backdrop-blur`。');
  lines.push('- **主按钮：** `bg-gradient-to-r from-violet-500 to-cyan-400 text-white rounded-xl h-10 px-4`。');
  lines.push('- **栅格：** 12 栏，间距 24px，内容区最大宽 1280px。');
  lines.push('- **四态：** 空状态含图标 + 引导 + 主按钮；骨架 `animate-pulse`；错误红色 inline banner 保留输入；成功 sonner toast。');
  lines.push('- **动效：** 150–250ms ease-out，仅用于 hover、面板展开、toast；禁止无限循环动画。');
  lines.push(
    '- **响应式：** ' +
      (isMobile
        ? '`<768px` 单列布局，主按钮固定底部；`≥1024px` 增加右侧信息面板。'
        : '`<1024px` 右侧面板收为悬浮按钮 + 抽屉；`<768px` 侧栏变底部 Tab。'),
  );
  lines.push('- **图标：** lucide-react，尺寸 16/20/24，禁止 emoji。');
  lines.push('');

  // 6. Steps
  lines.push('## 6. 分步实现');
  lines.push('');
  const steps: Array<[string, string, string, string]> = [
    [
      '初始化',
      'Create a ' + (/vue/i.test(tech) ? 'Vue 3 + Vite + TypeScript' : 'Next.js 14 TypeScript App Router') + ' project named ' + appSlug + ' with Tailwind. Dark mode only, path alias @/*.',
      '工程骨架、全局深色底色',
      '`npm run dev` 打开深色空页，控制台无报错',
    ],
    [
      '应用外壳',
      'Build a dark glass app shell with a 240px left sidebar, a topbar with search and avatar, and two fixed radial gradient blobs behind the content. Use lucide-react icons.',
      '`layout.tsx`、`sidebar.tsx`、`topbar.tsx`',
      '1440px 与 768px 下均无横向滚动',
    ],
    [
      '主角功能 · ' + features[0],
      'Build ' + FEATURE_ROUTES[0] + ' implementing the primary flow: input area, primary CTA, and a result panel with copy and export actions. Wire it to lib/mock-data.ts.',
      FEATURE_ROUTES[0] + '/page.tsx、结果面板组件',
      '完成一次主流程，结果在 3 秒内出现且可复制',
    ],
    [
      'AI 逻辑',
      'Create lib/ai.ts exporting the mock generation function with a "// TODO: replace with real API" first line, plus a useTypewriter hook at 30ms per character.',
      '`lib/ai.ts`、`hooks/use-typewriter.ts`',
      '调用 mock 函数返回结构化结果，打字机按 30ms 输出',
    ],
    [
      '支撑页面',
      'Build ' + (FEATURE_ROUTES[1] || '/settings') + ' and ' + (FEATURE_ROUTES[2] || '/settings') + ' reusing the shared components. Add list filtering and empty states.',
      '两个支撑路由页面',
      '从主流程跳转进入后数据一致，空状态可见',
    ],
    [
      '状态与数据层',
      'Add a zustand store in lib/store.ts persisting items to localStorage, and connect every page to it.',
      '`lib/store.ts`、各页面订阅',
      '刷新页面后数据不丢失',
    ],
    [
      '打磨',
      'Add empty states, loading skeletons, sonner toasts, responsive breakpoints, and a README containing a three-minute demo script.',
      '四态组件、`README.md`',
      '`npm run build` 通过，控制台零报错',
    ],
  ];
  steps.forEach((step, index) => {
    lines.push('**Step ' + index + ' · ' + step[0] + '**');
    lines.push('> `' + step[1] + '`');
    lines.push('');
    lines.push('产出：' + step[2]);
    lines.push('验收：' + step[3]);
    lines.push('');
  });

  // 7. Acceptance and demo
  lines.push('## 7. 验收与演示脚本');
  lines.push('');
  lines.push('| 时间 | 动作 | 期望结果 |');
  lines.push('| --- | --- | --- |');
  lines.push('| 0:00 | 打开首页 | 核心操作区与最近记录立即呈现 |');
  lines.push('| 0:40 | 完成一次 ' + features[0] + ' | 结果流式出现，排版完整 |');
  lines.push('| 1:30 | 保存并跳转详情 | 列表新增记录，数据一致 |');
  lines.push('| 2:10 | 切换筛选与导出 | 交互无卡顿，导出文件可用 |');
  lines.push('| 2:40 | 返回首页 | 统计数字已同步更新 |');
  lines.push('');
  lines.push('**硬性验收：** `npm run build` 通过；控制台零报错；首屏无布局跳动。');
  lines.push('');

  // 8. Assumptions
  lines.push('## 8. 假设与待确认项');
  lines.push('');
  if (assumed.length === 0) {
    lines.push('所有维度均由用户确认，无默认值假设。');
  } else {
    lines.push('| 维度 | 当前假设 | 影响范围 |');
    lines.push('| --- | --- | --- |');
    assumed.forEach((dim) => {
      const spec = DIMENSION_MAP[dim];
      lines.push('| ' + spec.label + ' | ' + spec.fallback + ' | ' + IMPACT[dim] + ' |');
    });
  }
  lines.push('');

  return { title: name + ' · 产品文档', markdown: lines.join('\n') };
}
