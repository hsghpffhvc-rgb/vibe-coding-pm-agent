# 产品文档生成

用户输入：$ARGUMENTS

执行步骤：

1. 读 `AGENTS.md`，进入 Phase 0/1。
2. 若上面输入为空或少于 15 字：先按 Phase 0 给 3 个产品方向，等待选择。
3. 若输入较完整：提取已确认维度，用结构化选项补齐缺失项，每轮 ≤ 5 个问题，最多 2 轮。
4. 信息足够后，按 `templates/product-doc-template.md` 的 8 节结构输出完整文档，风格对齐 `examples/flowdark.md`。
5. 输出前逐条过 `AGENTS.md` 第 6 节质量门禁，不通过先修文档。

约束：正文简体中文；Step prompt 英文且可直接复制；不写寒暄与结尾祝福。
