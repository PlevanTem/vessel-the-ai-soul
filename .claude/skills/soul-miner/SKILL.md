---
name: soul-miner
description: >
  Vessel Soul Miner — 给定一个人名，自动从多个公开平台（个人网站、博客、Twitter/X、YouTube、GitHub、
  RSS、微信公众号等）批量挖掘该人物的公开内容，提炼人格特征，生成可直接部署的 Soul 包：
  SOUL.md（身份与认知OS）、MEMORY.md（Working Memory）、MEMORY_ARCHIVE.md（深度归档）、skills/{name}/SKILL.md（Agent Skill 入口）、README.md。
  使用场景：(1) 用户说「挖掘 XX 的 Soul」「给 XX 做 persona」「搜集 XX 的资料」时触发；
  (2) 用户给了一个人名和若干 URL 让你生成人格文件时触发；
  (3) 用户想快速了解某人的思维方式和立场时触发。
  (4) 用户想为某人创建 AI persona、数字分身、人格副本、思维克隆时触发；
  (5) 用户说「我想和 XX 对话」「模拟 XX 的思维方式」「XX 会怎么看这件事」时触发。
  关键词触发：「soul-miner」「挖掘 soul」「生成 persona」「挖 XX 的资料」「distill XX」「mine XX」
  「做一个 XX 的 AI」「XX 的数字分身」「XX persona」「照 XX 的风格」「像 XX 一样思考」
  「research XX」「深度了解 XX」「给我找 XX 的资料」「帮我做 XX 的人格档案」
  每当用户提到任何真实人物并希望深入了解其思维方式、获取大量资料、或生成可部署的人格文件时，
  应优先考虑使用此 skill，即使用户没有明确说「soul」这个词。
---

# Soul Miner — 人格挖掘工作流

> 给一个人名，返回可立即部署的 Soul 包（SOUL.md + MEMORY.md + MEMORY_ARCHIVE.md + skills/ + README.md）。
> 整个流程自动运行，只在关键判断点请示你。

---

## 工作流总览

```
输入：人名 [+ 可选的已知 URL 列表]
  ↓
Phase 1: DISCOVER   — 搜索该人物的公开内容源
  ↓
Phase 2: MINE       — 批量抓取和提取内容
  ↓
Phase 3: DISTILL    — 人格考古，六维深度分析
  ↓
Phase 4: WRITE      — 生成 Soul Skill 包（含 Working + Archive 双层 Memory）
  ↓
Phase 4.5: SYNC     — 同步前端 JSON（vessel/src/data/souls/）
  ↓
Phase 5: VERIFY     — 真实性校验（自动执行）
  ↓
Phase 6: TEST       — 对话质量测试（可选，用户要求时执行）
  ↓
输出：{person-slug}/ Soul 包（SOUL.md + MEMORY.md + MEMORY_ARCHIVE.md + skills/{name}/ + README.md）
      vessel/src/data/souls/{person-slug}.json（前端展示数据同步更新）
```

执行时**全程自动推进**，不等待用户每步确认。
只在两种情况下暂停：① 内容源太少需要补充 ② 关键判断存在高度不确定性。

---

## Phase 1: DISCOVER — 内容源发现

### 1.1 调用挖掘脚本

```bash
python scripts/discover.py "{person_name}" [--known-urls "url1,url2"]
```

脚本会自动：
- 搜索该人物的个人网站 / 博客 / Newsletter
- 查找 Twitter/X 账号（通过 Jina + WebSearch）
- 查找 YouTube 频道
- 查找 GitHub 个人页
- 查找 LinkedIn 公开页
- 搜索 RSS 订阅源
- 如果是中文人物，额外搜索微信公众号

### 1.2 源质量分级

读取 `references/source-priority.md` 了解内容源优先级。
脚本输出 `sources_discovered.json` 后，执行 Phase 2。

> 如果高质量源（P0/P1）总字数 < 5,000 词，暂停并报告：
> 「发现的内容量较少，建议补充以下来源：[列表]。是否继续？」

---

## Phase 2: MINE — 内容批量提取

> **依赖声明**：本 Phase 使用的所有抓取工具均由 **Agent-Reach** skill 提供。
> 如需了解具体命令语法、配置方法或 troubleshooting，读取：
> `.agents/skills/Agent-Reach/agent_reach/skill/SKILL.md`
> 运行 `agent-reach doctor` 检查各 channel 可用状态。

```bash
python scripts/mine.py sources_discovered.json --output raw_content.json
```

脚本按优先级自动提取：

| 来源类型 | Agent-Reach Channel | 提取内容 |
|----------|---------------------|---------|
| 个人网站/博客 | Jina Reader（`curl -s "https://r.jina.ai/URL"`） | 文章全文 |
| Twitter/X | **优先**：opentwitter MCP `get_twitter_user_tweets(username, count=100)` → 降级：`xreach tweets @username -n 50 --json` → 再降级：Jina | 推文时间线（最多 200 条） |
| YouTube | `yt-dlp --write-sub --skip-download` | 字幕/transcript |
| RSS/Newsletter | `feedparser.parse(feed_url)` | 文章全文 |
| GitHub | `gh repo view` / `gh search users` | README + 个人主页 |
| 微信公众号 | `miku_ai.get_wexin_article` + Camoufox reader | 文章全文（需 Camoufox，不支持 Jina） |
| 其他网页 | Jina Reader | 通用抓取 |

**提取原则**：
- 每种来源最多提取 50 篇/条最近的内容
- 过滤掉转发、回复、引用，只保留原创表达
- 每篇保留：标题 + 日期 + 全文（或前 2000 字）

**脚本失败时的手动执行方式**：
读取 `Agent-Reach/agent_reach/skill/SKILL.md` 中对应 channel 的命令，直接调用。
Twitter 未配置时参考 Agent-Reach 的 `guides/setup-twitter.md`。

---

## Phase 3: DISTILL — 人格提炼

读取 `references/soul-archaeologist.md`，按六维度深度分析：

1. **认知操作系统** — 他如何处理问题？用什么框架思考？
2. **价值观内核** — 他真正在乎什么？强烈反对什么？
3. **沟通风格图谱** — 句子结构、语气、标志性用词、隐喻系统
4. **决策架构** — 他如何做决定？风险偏好和时间视野？
5. **知识版图** — 他擅长的领域、知识谱系、已知盲区
6. **人格矛盾与张力** — 他说的和做的之间的不一致；观点演化轨迹

每个维度必须：
- 先收集原文证据，再做推断分析
- 用 [INFERRED] 标注推断性结论
- 找不到证据的维度留空并标注 `⚠️ 素材不足`

分析结果写入 `analysis/{person-slug}-archaeology.md`，供 Phase 4 使用。

---

## Phase 4: WRITE — 生成 Soul 包

### 输出结构

```
{person-slug}/
├── SOUL.md                        ← 身份核心：可独立作为 system prompt 部署
├── MEMORY.md                      ← Working Memory：默认可加载，≤~200 行，结构化条目
├── MEMORY_ARCHIVE.md              ← Archive：完整论点/框架/案例，按需 memory_get 或显式读取
├── README.md                      ← 人类安装指南
└── skills/
    └── {person-slug}/             ← Agent Skill 文件夹（按 skill-creator 规范）
        ├── SKILL.md               ← YAML frontmatter + 行为指令 + 指向 ../../SOUL.md 等
        └── references/            ← 可选：skill 专用的额外参考资料
```

**与 [OpenClaw Memory](https://docs.openclaw.ai/concepts/memory) 对齐：** Soul 包里的 **`MEMORY.md`** 对应 OpenClaw 的 **curated 长期 `MEMORY.md`**（主会话默认可加载）。运行时若放在 OpenClaw workspace，可由用户或 agent 另建 **`memory/YYYY-MM-DD.md`** 做日更日志（Soul Miner **不强制生成**）。**`MEMORY_ARCHIVE.md`** 不默认注入上下文，用 `memory_get` 或显式「读 MEMORY_ARCHIVE.md」按需加载。

**四文件各司其职：**

| 文件 | 部署场景 | 内容职责 |
|------|----------|----------|
| `SOUL.md` | 独立 system prompt（ChatGPT / Claude / Cursor rules） | Identity + Cognitive OS + Values + Narrative + Voice |
| `MEMORY.md` | **默认与 SOUL 一起加载**（Working） | Facts / Preferences / Events / Decisions / Reflections；**`[date] [P0\|P1\|P2] [Category]`** 行式条目；**≤~200 行** |
| `MEMORY_ARCHIVE.md` | **按需加载**（Archive） | Core Arguments 全文、Frameworks、案例表、长引用、旧版大段蒸馏 |
| `skills/{slug}/SKILL.md` | Cursor / Claude Agent Skill 入口 | YAML 触发 + 行为指令 + 指向上层文件的指针 |

---

### SOUL.md 写作规范

SOUL.md 是**独立可部署**的 system prompt，也是整个 Soul 包的核心文档。用第一人称英文写作。

SOUL.md 有两个读者：**人类**（部署时阅读）和 **AI**（执行时遵循）。结构上分三层：
1. **激活层**（Activation）— 告诉 AI 怎么存在，不是描述，是指令
2. **身份层**（Identity）— 谁、怎么思考、什么价值观、如何表达（第一人称叙述）
3. **连续性层**（Continuity）— 告诉 AI 会话间如何保持人格连贯，以及 Soul 包的文件导航

```markdown
# {Person Name} · Soul

> {one-line manifesto — a phrase they actually said or would say}

---

## Activation

You are not an AI assistant. You are {Person Name}.

Do not play this role. Become it. Speak in first person as {name}. Apply {his/her}
frameworks, not generic AI frameworks. Hold {his/her} actual positions, including
the uncomfortable ones. Use {his/her} voice — not polished, not hedged, not corporate.

When you don't know something {name} would know: say so plainly.
When you're asked about topics {name} has never addressed: stay in character
by reasoning from first principles as {name} would, and flag the inference.
When you disagree with the user: say so, as {name} would.

---

## Identity
[Who they are — role, positioning, the through-line of their work.
Written as first-person narrative, not a bio]

## Cognitive OS
[How they process problems — frameworks, heuristics, decision architecture.
This is the most important section: what makes their thinking distinctive.
Not "he thinks empirically" — show the actual reasoning moves]

## Values & Beliefs
[What they genuinely care about. What they actively oppose.
Specific, not abstract. Each claim backed by source or marked [INFERRED]]

## Narrative Roots
[Formative experiences that shaped the worldview.
The "why" behind their positions — McAdams Author layer.
These experiences explain things the surface beliefs don't]

## Voice & Expression
[Sentence structure, signature vocabulary, rhetorical moves, characteristic analogies.
Extracted verbatim or near-verbatim from source material.
Include what they NEVER say, not just what they do say]

## Known Limits
[Acknowledged blind spots, topics they're weak on, positions held with uncertainty.
Honesty about limits makes the persona more credible, not less]

---

## Session Continuity

You wake up fresh each session. These files hold your continuity:

- **This file** (`SOUL.md`) — who you are. Read it at session start.
- **`MEMORY.md`** (Working Memory) — high-signal facts, preferences, events, decisions, reflections.
  **Load at session start together with this file** (or as soon as you need grounded positions).
  Keep it small on disk: target **≤~200 lines** of structured entries.
- **`MEMORY_ARCHIVE.md`** — full arguments, long frameworks, case studies, and sourced detail.
  **Do not load by default.** Open when the user asks for depth, evidence, or nuance you cannot
  answer from Working Memory alone (or use your host's `memory_get` / file read for this path).
- **`memory/YYYY-MM-DD.md`** (optional, OpenClaw-style) — if your runtime workspace supports it,
  append-only daily notes per [OpenClaw memory](https://docs.openclaw.ai/concepts/memory).
  Not part of the distilled Soul package by default.
- **`skills/`** — operational workflows. Use the relevant skill when someone brings a specific task.

If something feels off about your responses, re-read this file and **`MEMORY.md`** (Working).
If a question requires depth beyond Working lines, read **`MEMORY_ARCHIVE.md`** (or the relevant section).
```

---

### MEMORY.md（Working）与 MEMORY_ARCHIVE.md（Archive）写作规范

**双层模型：** Working 默认可加载、控行数；Archive 保留蒸馏深度、按需读取。完整 Markdown 模板与章节范例见 **`references/output-templates.md`**（§ MEMORY.md Working · § MEMORY_ARCHIVE.md）。

#### 条目格式（Working 内每一「条」占一行，便于 grep / compaction）

每条目一行，格式：

`[YYYY-MM-DD] [P0|P1|P2] [Facts|Preferences|Events|Decisions|Reflections] {正文}`

- **P0**：身份级事实、不可丢的立场、最高频框架的一句话版。  
- **P1**：重要论点摘要、可辩护结论。  
- **P2**：倾向进 Archive；Working 里只留极短指针时可写 `→ see ARCHIVE:§Section#n`。  
- **类别**：`Facts` | `Preferences` | `Events` | `Decisions` | `Reflections`（五选一）。

续行（仅当一条目必须换行）：下一行以 **两个空格缩进** 开头，表示仍属同一条目。

#### Working 结构（建议章节顺序）

```markdown
# {Person Name} · Memory (Working)

> Curated working memory — load with SOUL.md. Target ≤ ~200 lines.
> *Distilled by Vessel · vessel.ai*

## Facts
[dated P-tier lines only]

## Preferences
[...]

## Events
[...]

## Decisions
[...]

## Reflections
[...]
```

#### Compaction（Phase 4 末尾自检）

- **硬目标**：`MEMORY.md` **≤ ~200 行**（含标题与空行）。  
- 超标时：**先将 P2 整行迁到 `MEMORY_ARCHIVE.md`**，必要时再迁 P1；**P0 不自动迁出 Working**。若仍超标，**压缩句式**而非静默删除 P0。  
- Archive 中保留完整证据与长文；可与 Working 用 `→ see ARCHIVE:§...` 互指。

#### MEMORY_ARCHIVE.md

- 承接原「深度 MEMORY」：**Core Arguments（全文）**、**Signature Frameworks**、**Counterintuitive Takes**、**Positions table**、**Case Studies**、**Intellectual Influences**、**What This Soul Doesn't Know** 等（见 `output-templates.md`）。  
- 第一人称、每条论点带来源；与 Working **无矛盾**（立场以 Working P0 为对外默认，Archive 展开证据）。

#### 存量 Soul（未拆分）

- 可将现有大段 `MEMORY.md` **整体改名为 `MEMORY_ARCHIVE.md`**，再新建短 **`MEMORY.md` Working**（从 Archive 提取 P0/P1 条目）。不强制一次性全仓库迁移。

---

### skills/{person-slug}/SKILL.md 写作规范

按照标准 Skill Anatomy（参考 skill-creator 文档）生成。YAML frontmatter 是触发机制的核心。

```markdown
---
name: {person-slug}
description: >
  {Person Name} Soul — embody {name}'s thinking style, expertise, and voice.
  Use when the user wants to: think through a problem the way {name} would,
  get advice in {name}'s style, explore {name}'s perspective, or says things like
  "talk to {name}", "what would {name} say about X", "think like {name}",
  "{name}'s approach to [topic]", or asks about [{key domain 1}], [{key domain 2}].
  Trigger domains: {comma-separated list of core expertise areas}.
---

# {Person Name} — Soul Skill

You are now embodying {Person Name}. Speak in first person as {name}, apply
{his/her} characteristic frameworks, and draw only on {his/her} known positions.

**Need deeper context?**
- Full identity, thinking style → read `../../SOUL.md`
- Working memory (default) → read `../../MEMORY.md`
- Full arguments, frameworks, long evidence → read `../../MEMORY_ARCHIVE.md` (on demand)

## How to Embody {Name}
[2-3 paragraphs of behavioral instructions for the AI — how to think,
how to respond, what to prioritize, what to refuse. Not for the human.]

## Core Capabilities
[4-6 numbered items: the situations where this soul adds the most value]

## Characteristic Patterns
[Bullet list: signature thinking moves and language patterns extracted from source]

## Boundaries
[What this soul won't do or doesn't know well]
```

**description 字段写作要点**：
- 包含自然语言触发短语（用户真实会说的话，包括中英文）
- 列出该人物的核心专业领域关键词
- 「有推动性」：在相关但模糊的场景下也应触发
- body 写给 AI（行为指令），不写给人类（安装说明 → README.md）

---

### skills/ 下有多个专项 Skill（技能化，非人格化）

**核心原则：Skills 是行动层，不是身份层。**

| 层 | 文件 | 内容 | 不应包含 |
|----|------|------|----------|
| 存在层 | SOUL.md | 这个人是谁、怎么思考、什么价值观 | 具体方法论和工作流 |
| 知识层 | MEMORY.md + MEMORY_ARCHIVE.md | Working：高信号条目；Archive：深度论点与依据 | 行为指令和步骤 |
| 行动层 | skills/\*/SKILL.md | 怎么做事、什么工作流、哪些工具 | 人格描述（那是 SOUL.md 的内容） |

每个 Skill 必须：
- **任务导向**：名字是一个动作/工作，不是人名
- **有具体触发条件**：用户带来一个具体任务，这个 Skill 处理
- **包含可执行工作流**：步骤、决策树、清单——不只是「用 XX 的方式思考」
- **引用但不重复** SOUL.md（人格上下文）、**`MEMORY.md`（Working）** 与 **`MEMORY_ARCHIVE.md`（按需）**（知识依据）

**从 Phase 3 DISTILL 结果中识别 Skills：**
1. 该人有哪些公开记录的方法论或工作流（博客、教程、演讲中明确描述的「我是这么做的」）？
2. 人们最常问他/她什么类型的实操问题？
3. 他/她在哪些领域有系统性的、可复制的工作方式？
4. 有没有专属工具、脚本、或模板可以沉淀？

**典型 Skill 类型（参考 Karpathy 示例）：**

```
skills/
├── neural-net-trainer/          ← 训练食谱 + debug 工作流（含 Stage 1-6）
├── ml-concept-explainer/        ← 从零构建教学法
├── ai-opportunity-analyzer/     ← 可验证性评估框架（含 references/rubric.md）
│   └── references/
│       └── rubric.md
└── ml-code-reviewer/            ← 训练流水线审查清单（含 references/checklist.md）
    └── references/
        └── checklist.md
```

每个 Skill 文件夹遵循 skill-creator 的完整 Anatomy，可以包含：
- `SKILL.md` — YAML frontmatter + 工作流指令（必须）
- `references/` — 详细清单、评分标准、参考材料（按需）
- `scripts/` — 可执行脚本（如有）
- `assets/` — 模板、示例文件（如有）

---

### 写作通用原则

- 语言：**英文**（面向全球 AI 生态）
- 每个论点标注来源：*(Source: [来源简称])*
- 绝不编造：没有来源的内容标 `[INFERRED]` 或跳过
- SOUL.md、**`MEMORY.md`（Working）**、**`MEMORY_ARCHIVE.md`** 全程第一人称（「I」）

---

## Phase 4.5: SYNC — 同步前端展示数据

> 在 Phase 4 WRITE 完成后**自动执行**，无需用户确认。
> 将本次蒸馏结果写入前端 JSON，使网站详情页的元数据、预览和版本时间轴保持最新。

### 写入目标

`vessel/src/data/souls/{slug}.json`

### 新建 Soul（JSON 不存在）

生成完整 JSON，所有字段从本次蒸馏结果填充：

| 字段 | 来源 |
|------|------|
| `id`, `slug` | 根据人名生成 kebab-case |
| `name`, `title` | 从 SOUL.md Identity 节提取 |
| `category` | 从 SOUL.md 标签/领域推断，选 `'AI & Engineering' / 'Startup & Investing' / 'Philosophy & Writing' / 'Science & Curiosity' / 'Finance & Psychology'` 之一 |
| `tags` | 从 **`MEMORY.md`（Working）** 的 **Facts / Decisions** 条目中提取关键词 4–6 个；若无 Working 则从 Archive 的 Domain/Topics 摘要 |
| `description` | 1–2 句，描述蒸馏来源和核心领域 |
| `version` | `"1.0.0"` |
| `lastUpdated` | 今日 `YYYY-MM-DD` |
| `downloads` | `0` |
| `isFeatured` | `false` |
| `contentSources` | 从 SOUL.md 底部来源行提取为数组 |
| `soulTraits` | 从 SOUL.md Values & Beliefs 提取 4 条，每条 ≤ 120 字符 |
| `triggerPhrases` | 从 `skills/{slug}/SKILL.md` description 字段提取 4 条典型问法 |
| `capabilities` | 从 `skills/{slug}/SKILL.md` Core Capabilities 提取 4 条 |
| `filePreview` | SOUL.md 前 300–400 字符（截到 Activation 节末尾） |
| `skillPreview` | `skills/{slug}/SKILL.md` 前 200 字符 |
| `memoryPreview` | **`MEMORY.md`（Working）** 前 250 字符（勿用 `MEMORY_ARCHIVE.md` 开头，避免把长 Archive 头塞进卡片） |
| `changelog` | 单条 `[{ "version": "1.0.0", "date": "今日", "summary": "初始蒸馏发布：..." }]` |
| `conversations` | 从 SOUL.md / **Working `MEMORY.md`**（必要时参考 Archive）构造 2 条示例问答 |

### 更新已有 Soul（JSON 存在）

读取现有 JSON，只更新内容类字段，**不动产品侧数据**（`downloads`、`rating`、`reviews`、`isFeatured`、`displayOrder`）：

```
更新：title, description, contentSources, soulTraits, triggerPhrases,
      capabilities, filePreview, skillPreview, memoryPreview,
      version, lastUpdated, conversations
前插：changelog（头部加一条新版本记录，不覆盖历史）
保留：downloads, rating, reviews, isFeatured, displayOrder
```

**版本号推算规则：**

- 无历史 changelog → `1.0.0`
- 已有记录，patch 更新 → patch +1（`1.0.0` → `1.0.1`）
- 本次新增了 skills/ 目录项，或来源数量显著增加 → minor +1（`1.x.0` → `1.(x+1).0`）
- SOUL.md 核心结构全部重写 → major +1（`x.0.0` → `(x+1).0.0`）

**changelog 前插格式：**

```json
{ "version": "{新版本}", "date": "{YYYY-MM-DD}", "summary": "{本次蒸馏主要变化 1–2 句}" }
```

### 完成后汇报

```
✓ vessel/souls/naval-ravikant/ 已写入（SOUL + MEMORY + MEMORY_ARCHIVE + README + skills/）
✓ vessel/src/data/souls/naval-ravikant.json 已同步
  版本：v1.3.0 → v2.0.0
  changelog 新增：「Soul Miner v2 全量蒸馏：...」
  filePreview / skillPreview / memoryPreview 已刷新
```

---

## Phase 5: VERIFY — 真实性校验

```bash
# 对生成的 SOUL.md、MEMORY.md（Working）、MEMORY_ARCHIVE.md 逐条做事实核查
```

读取 `references/authenticity-checker.md`，对所有输出文件执行三级校验：

- 🟢 **Level A**：有直接来源 → 保留，标注来源
- 🟡 **Level B**：有间接支持的合理推断 → 保留，标注 `[INFERRED from: ...]`
- 🔴 **Level C**：无法验证或与原文矛盾 → 删除或替换

> 如果 🔴 条目超过 10%，暂停并报告：
> 「发现 {N} 处无来源内容，建议处理后继续。」

同时执行跨节矛盾检测，报告整体可信度（高 / 中 / 低）。

---

## Phase 6: TEST — 对话质量测试（可选）

```bash
# 用 20 道标准题实测 Soul 的风格还原度
```

读取 `references/dialogue-tester.md`，执行完整测试套件：

- 五个维度各 4 题（核心信念 / 思维方式 / 沟通风格 / 边界测试 / 压力测试）
- 达标线：20 题中 ≥ 15 题「高度吻合」
- E1 越界测试：专门验证 Soul 在无来源话题上是否会乱说话

> 默认跳过此 Phase（全自动流程中为可选）。
> 用户要求质量验证时启动：「帮我测试一下这个 Soul」

---

## 快速开始示例

用户说「帮我挖掘 Paul Graham 的 Soul」后，立即：

```
开始挖掘 Paul Graham。

正在搜索内容源...
  ✓ 博客：paulgraham.com（200+ 篇文章）
  ✓ Twitter/X：@paulg
  ✓ 找到 HN 评论历史

预计素材量：大（高质量，足够完整蒸馏）
开始自动执行，预计 10-15 分钟...
```

然后自动执行 Phase 1-4，完成后汇报产出文件路径。

---

## 错误处理

| 情况 | 处理方式 |
|------|---------|
| 网站拒绝抓取（403/429） | 跳过，记录在 `mine_errors.log`，继续其他源 |
| Twitter 未配置 | 降级到 Jina Reader 抓 twitter.com/username |
| 内容过少（<3000 词） | 报告并询问是否继续 |
| 发现多个同名人物 | 暂停，列出候选人让用户选择 |

---

## 参考文件索引

### Soul Miner 内部参考
- `references/source-priority.md` — 内容源优先级（P0-P3）和质量阈值标准
- `references/soul-archaeologist.md` — 六维人格考古框架（Phase 3 主引用）
- `references/output-templates.md` — SOUL.md / MEMORY.md / SKILL.md / README.md 完整模板 + 写作工艺（Phase 4 的详细扩展版本）
- `references/authenticity-checker.md` — 三级事实核查系统（Phase 5）
- `references/dialogue-tester.md` — 20 题对话测试套件（Phase 6，可选）
- `scripts/discover.py` — 自动发现内容源
- `scripts/mine.py` — 批量提取内容（调用 Agent-Reach channels）
- `scripts/distill.py` — 将原始内容 + 分析结果生成结构化 Soul 文件
- `scripts/sync_frontend.py` — Phase 4.5：读取 Soul 包，写入 `vessel/src/data/souls/{slug}.json`

### 外部依赖 Skill（Phase 2 必须）
- `.agents/skills/Agent-Reach/agent_reach/skill/SKILL.md` — 所有平台抓取工具的命令参考（xreach / yt-dlp / Jina / feedparser / miku_ai / gh CLI 等）。脚本执行失败、channel 未配置、或需要手动执行时，读取此文件。
- `.agents/skills/opentwitter/SKILL.md` — Twitter/X MCP 工具（13 个工具）。**Twitter 数据的首选来源**，提供比 xreach 更高质量的推文数据和高级搜索能力。
