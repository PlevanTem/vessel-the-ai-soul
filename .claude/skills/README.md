# Skills 目录结构说明

这里有两类文件，层级不同，不要混淆：

---

## 第一层：独立可复用 Skill（工具库）

放在顶层子目录下，可以在任何上下文中单独调用。

```
.agents/skills/
├── Agent-Reach/              ← 多平台内容搜索/抓取工具（Twitter/X、小红书、B站等）
├── skill-creator/               ← 创建/评估/优化 skill 的元工具
├── soul-miner/                  ← 人格挖掘工具：给人名 → 输出三文件 Soul 包
```

这些 skill 各自有完整的 `SKILL.md`，内含自己的工作流、数据和脚本，可以独立触发。

---

## Skill 内部标准结构

每个独立 Skill 遵循 skill-creator 规范的三层结构：

```
soul-miner/
├── SKILL.md          ← 必须。YAML frontmatter（name + description）+ Markdown 工作流
├── references/       ← 可选。按需加载的文档（框架 / 模板 / 规范）
│   └── *.md
├── scripts/          ← 可选。可执行脚本，确定性/重复性任务
│   └── *.py
├── assets/           ← 可选。输出用的模板文件（HTML 模板、图标等）
└── evals/            ← 可选但推荐。测试用例（遵循 skill-creator evals.json 格式）
    └── evals.json
```

> ⚠️ **注意**：`.agents/skills/opentwitter/` 目录当前为**空目录**，没有 SKILL.md，不构成可用 skill，暂时不参与任何工作流。如需启用请补充 SKILL.md 文件。

**三层加载机制（Progressive Disclosure）：**
1. **Metadata**（name + description）— 始终在上下文，约 100 词，决定 skill 是否被触发
2. **SKILL.md body** — skill 触发时加载，建议控制在 500 行以内
3. **references/ & scripts/** — 按需读取/执行，文件体积不限

---

```
soul-miner/SKILL.md
  ├─ Phase 1: scripts/discover.py     → 多平台内容源发现
  ├─ Phase 2: scripts/mine.py         → 批量内容抓取（依赖 Agent-Reach 工具）
  ├─ Phase 3: references/soul-archaeologist.md → 六维人格考古框架
  ├─ Phase 4: references/output-templates.md  → 三文件生成模板
  ├─ Phase 5: references/authenticity-checker.md → 真实性校验
  └─ Phase 6: references/dialogue-tester.md   → 对话质量测试（可选）
```

---

## evals.json 格式（skill-creator 标准）

```json
{
  "skill_name": "skill-name",
  "evals": [
    {
      "id": 1,
      "name": "descriptive-test-name",
      "prompt": "用户会实际输入的测试 prompt（具体、真实，非抽象）",
      "expected_output": "期望产出的描述",
      "files": [],
      "assertions": [
        { "text": "可客观验证的断言描述", "type": "assertion_type" }
      ]
    }
  ]
}
```

---

## 重要原则

- **独立 skill** 有自己的判断和工作流，调用时"读取 SKILL.md → 按其流程执行"
- **pipeline agents** 是编排层，不要和独立 skill 的工作流重叠描述；遇到领域问题应委托给对应工具
- 有新的通用设计工具或前端能力，加在 `designer/` 或 `frontend/` 下；pipeline 专属的调整改 `agents/` 下的文件
- 所有 Skill 的 description 字段应足够"pushy"（参见 skill-creator），避免 under-trigger
- 新建 skill 后，用 `skill-creator` 跑 evals 验证效果，再上线
