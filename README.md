# 个人产品专家 Agent

把模糊想法收敛成 **Cursor 可直接执行的深色系 demo 产品文档**。基于 Vibe Coding 场景设计，输出 8 节固定结构，每节都能被 AI IDE 无歧义解析。

## 两种用法

| 形态 | 位置 | 说明 |
| --- | --- | --- |
| **Web 工作台** | `web/` | 深色玻璃界面，三栏布局，对话式采集 + 实时简报 + 一键导出 `.md`。默认本地引擎无需 API Key，配置 `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` 可切换为模型驱动 |
| **Cursor 内使用** | 根目录 `AGENTS.md` | 在 Cursor 对话中直接调用，行为规范与 Web 版完全一致 |

Web 版启动：

```bash
cd web && npm install && npm run dev   # http://localhost:3000
```

## 文件结构

```
AGENTS.md                            # Agent 大脑：角色、铁律、九维表、工作流、质量门禁
templates/product-doc-template.md    # 文档骨架，填充即产出
examples/flowdark.md                 # 黄金样本，对齐密度与语气
web/                                 # 网页端工作台（Next.js 14）
.cursor/rules/product-expert.mdc     # 按需挂载的规则
.cursor/commands/product-doc.md      # 斜杠命令 /product-doc
.cursor/agents/product-expert.md     # 子代理声明（可选）
```

## 三种用法

**1. 直接对话（默认）**
在 Cursor 里打开本仓库，直接说「帮我做一个 XX 产品文档」。根目录 `AGENTS.md` 会被自动加载，Agent 按九维表提问并产出文档。

**2. 斜杠命令**
输入 `/product-doc 一句话想法`，一次性触发完整流程（Phase 0 → 提问 → 生成）。

**3. 子代理 / 规则**
- 子代理：在 Cursor 的子代理列表里选 `product-expert`，适合把文档任务与写代码任务隔开。
- 规则：若不想全局生效，把 `AGENTS.md` 的内容并入 `.cursor/rules/product-expert.mdc` 并设为手动挂载。

> 不同 Cursor 版本对 `agents` 目录的支持不一致。若子代理未出现在列表中，用方式 1 或 2，功能完全等价。

## 工作流

```
一句话想法
  └─ Phase 0  给 3 个方向，用户选一个
       └─ Phase 1  提取已确认维度，复述清单
            └─ Phase 2  ≤5 问 / 轮，≤2 轮，带推荐项
                 └─ Phase 3  按 8 节结构生成
                      └─ Phase 4  质量门禁 12 条自检
                           └─ Phase 5  只改被点名的段落
```

## 九维采集

目标用户 / 痛点 / 功能 / 价值 / 场景 / 类似产品 / 平台 / 界面 / 其他要求。
每维都有默认值：用户不愿回答时直接按默认补齐，并在文档第 8 节「假设与待确认项」中标注影响范围。**不会因为一个维度卡住流程。**

## 文档的 8 节结构

1. 项目概述（含一句话定位与竞品参考）
2. 用户与场景（含首屏第一画面）
3. 功能规格（每功能：ID / 路由 / 交互流 / 数据 / 四态 / 验收；标 1 个主角功能；含 Out of scope）
4. 技术建议（技术栈、10 个设计 token、文件树、mock-first 策略）
5. UI/UX 指导（Tailwind class 串、栅格、四态、动效、响应式断点）
6. 分步实现（5–8 步，每步英文 prompt + 产出 + 验收）
7. 验收与演示脚本（3 分钟逐秒脚本 + 硬性验收）
8. 假设与待确认项

## 语言约定

- 正文：简体中文
- 给 Cursor 的 prompt：英文（代码生成精度更高，可直接复制）
- 代码注释与 log：英文

## 定制

| 想改什么 | 改哪里 |
| --- | --- |
| 默认技术栈 | `AGENTS.md` 第 3 节维度 i 的默认值 |
| 默认视觉风格 | `AGENTS.md` 第 3 节维度 h + 第 5.5 节 |
| 文档章节 | `templates/product-doc-template.md`，同步更新 `AGENTS.md` 第 5 节 |
| 质量门禁 | `AGENTS.md` 第 6 节 |
| 禁止事项 | `AGENTS.md` 第 7 节反模式表 |

改章节结构时，`AGENTS.md` 第 5 节与模板文件必须同时改，否则 Agent 会产出不一致的结构。
