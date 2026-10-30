import type { Brief, DimensionId } from './types';

export interface DimensionSpec {
  id: DimensionId;
  label: string;
  hint: string;
  fallback: string;
  probe: string;
  options: string[];
  multi: boolean;
  group: 'core' | 'extra';
}

export const DIMENSIONS: DimensionSpec[] = [
  {
    id: 'name',
    label: '产品名',
    hint: '2 个词以内，中英混排',
    fallback: 'NovaFlow',
    probe: '给它起个名字，演示时观众能记住就行。',
    options: ['NovaFlow', 'Briefly', 'Aurora'],
    multi: false,
    group: 'core',
  },
  {
    id: 'user',
    label: '目标用户',
    hint: '角色 + 工作方式 + 熟练度',
    fallback: '独立创作者与 1–5 人小团队，桌面端为主，不写代码',
    probe: '谁每天打开它？在什么设备、什么工作流里用？',
    options: [
      '独立创作者 / Freelancer，笔记本为主',
      '1–5 人小团队，非技术背景',
      '企业内部运营 / 市场人员',
      '开发者 / 技术团队',
    ],
    multi: false,
    group: 'core',
  },
  {
    id: 'pain',
    label: '核心痛点',
    hint: '≤ 3 条，可感知、可量化',
    fallback: '重复劳动多、信息分散、进度不可见',
    probe: '现在这件事你要花多久？哪一步最烦？',
    options: [
      '重复劳动多，每次都要重做一遍',
      '信息分散在多个工具里，汇总靠手工',
      '进度和结果不可见，无法一眼掌握',
      '产出格式不统一，交付前要反复返工',
    ],
    multi: true,
    group: 'core',
  },
  {
    id: 'features',
    label: '核心功能',
    hint: '3–5 个，一次会话内可点完',
    fallback: '核心工作台、结果详情、AI 生成、导出',
    probe: '演示时你希望观众看到哪 3 个动作？',
    options: [
      'AI 生成（输入即产出结构化结果）',
      '工作台看板（列表 / 状态 / 筛选）',
      '详情页编辑与协作',
      '数据可视化（图表 / 趋势）',
      '一键导出（Markdown / PDF）',
    ],
    multi: true,
    group: 'core',
  },
  {
    id: 'value',
    label: '产品价值',
    hint: '一句话，含数字或对比',
    fallback: '把 3 小时手工劳动压缩成 60 秒',
    probe: '用户为什么不用 Excel 或现有竞品？',
    options: [
      '省时间：把 3 小时压缩到 1 分钟',
      '少出错：格式与口径统一，零返工',
      '看得清：进度与结果一屏掌握',
      '门槛低：不用配置，打开即用',
    ],
    multi: false,
    group: 'core',
  },
  {
    id: 'scenario',
    label: '主要场景',
    hint: '触发时机 + 前后步骤 + 交付物',
    fallback: '收到输入 → 处理 → 产出交付物',
    probe: '用户从哪进来？最后带走什么？',
    options: [
      '收到客户需求 → 生成方案 → 导出交付',
      '每天早晨 → 查看看板 → 安排当天任务',
      '数据更新 → 自动汇总 → 生成周报',
      '灵感出现 → 快速记录 → 整理成结构化内容',
    ],
    multi: false,
    group: 'extra',
  },
  {
    id: 'competitor',
    label: '类似产品',
    hint: '1–3 个，明确借鉴哪一部分',
    fallback: 'Linear（布局）+ Raycast（质感）+ Notion AI（AI 面板）',
    probe: '有没有你觉得「就长这样」的产品？',
    options: [
      'Linear：侧栏 + 命令面板的克制布局',
      'Raycast：玻璃质感与快捷键体验',
      'Notion：文档与 AI 面板结合',
      'Arc：彩色渐变与活泼氛围',
    ],
    multi: true,
    group: 'extra',
  },
  {
    id: 'platform',
    label: '平台',
    hint: 'Web / Mobile / Desktop / 插件',
    fallback: 'Web 响应式，桌面 1440px 优先',
    probe: '桌面优先还是手机优先？',
    options: ['Web 响应式，桌面优先', '移动端 App 优先', '桌面客户端', '浏览器插件'],
    multi: false,
    group: 'extra',
  },
  {
    id: 'ui',
    label: '界面要求',
    hint: '风格词 + 参考 + 必备组件',
    fallback: '深色玻璃拟态 + 紫青渐变，克制留白',
    probe: '喜欢 Linear 的克制还是 Arc 的彩色？',
    options: [
      '深色玻璃拟态 + 紫青渐变',
      '极简纯黑 + 单色强调，参考 Linear',
      '深色 + 高饱和渐变，参考 Arc',
      '深色 + 等宽字体终端风',
    ],
    multi: false,
    group: 'extra',
  },
  {
    id: 'tech',
    label: '技术栈',
    hint: '框架 / UI 库 / 明确不做项',
    fallback: 'Next.js 14 + TypeScript + Tailwind + shadcn/ui + zustand',
    probe: '有指定框架或 API 吗？哪些功能明确不做？',
    options: [
      'Next.js 14 + Tailwind + shadcn/ui',
      'Vue 3 + Vite + Tailwind',
      'React + Vite + Tailwind',
      '纯 HTML/CSS/JS 单文件',
    ],
    multi: false,
    group: 'extra',
  },
];

export const DIMENSION_MAP: Record<DimensionId, DimensionSpec> = DIMENSIONS.reduce(
  (acc, item) => ({ ...acc, [item.id]: item }),
  {} as Record<DimensionId, DimensionSpec>,
);

/** Order used when asking: the 9 core dimensions first, then extras. */
export const ASK_ORDER: DimensionId[] = [
  'name',
  'user',
  'pain',
  'features',
  'value',
  'scenario',
  'competitor',
  'platform',
  'ui',
  'tech',
];

export const BATCH_SIZE = 5;

export function missingDimensions(brief: Brief): DimensionId[] {
  return ASK_ORDER.filter((id) => !brief[id] || !String(brief[id]).trim());
}

export function splitValues(value: string): string[] {
  return value
    .split(/[、;；]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
