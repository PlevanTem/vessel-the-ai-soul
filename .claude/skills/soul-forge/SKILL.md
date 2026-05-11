---
name: soul-forge
description: >
  Soul Forge — 基于用户提供的参考文件（链接、文章、日记、对话记录、演讲稿、笔记、代码注释等）
  蒸馏生成可直接部署的 Soul 包：SOUL.md（身份与认知OS）、MEMORY.md（Working Memory）、
  MEMORY_ARCHIVE.md（深度归档）、skills/{name}/SKILL.md（Agent Skill 入口）、README.md，并同步前端 JSON。
  与 soul-miner 的区别：soul-miner 自主搜索互联网挖掘公众人物；soul-forge 以用户主动提供的
  材料为核心驱动——用户给文件就读文件，给链接就抓链接，给方向就补充搜索，但不会自行
  决定去哪里挖掘。主动权在用户手中，Agent 负责深度提炼。
  适用场景：
  (1) 用户提供自己的文章/日记/对话，想生成自己的数字分身或 AI 副本时触发；
  (2) 用户给了一批文件（路径、文档内容）或链接，说「帮我蒸馏成 Soul」「基于这些资料生成人格」时触发；
  (3) 为团队内部人物、虚构角色、或无大量公开网络资料的人生成 Soul 时触发；
  (4) 用户说「我给你我的资料，你帮我做数字分身」「基于我的文章生成 persona」时触发；
  (5) 用户想快速从已有内容中提炼思维模式、立场、风格文件时触发。
  关键词触发：「soul-forge」「基于文件生成 soul」「我的数字分身」「帮我蒸馏」「从文件生成 persona」
  「我给你资料」「基于这些文章」「我的文章/日记/笔记 → soul」「forge soul」「我提供材料」
  「distill from files」「personal soul」「self soul」「我的 AI 副本」「数字克隆自己」
---

# Soul Forge — 从本地资源和参考蒸馏 Soul

> 给一批文件，返回可立即部署的 Soul 包（SOUL.md + MEMORY.md + MEMORY_ARCHIVE.md + skills/ + README.md）。

---

## 工作流总览

```
输入：文件路径 / 粘贴文本 / URL 链接 / 「去看一下他的 XX」等引导指令
  ↓
Phase 1: INTAKE     — 整理所有素材来源，识别类型与质量
  ↓
Phase 2: COLLECT    — 读取文件 + 抓取链接 + 按用户引导补充搜索
  ↓
Phase 3: DISTILL    — 人格考古，六维深度分析
  ↓
Phase 4: WRITE      — 生成 Soul 包（含 Working + Archive 双层 Memory）
  ↓
Phase 4.5: SYNC     — 同步前端 JSON（vessel/src/data/souls/）
  ↓
Phase 5: VERIFY     — 一致性校验（自动执行）
  ↓
输出：{person-slug}/ Soul 包（SOUL + MEMORY + MEMORY_ARCHIVE + README + skills/）+ vessel/src/data/souls/{slug}.json
```

全程自动推进，只在两种情况下暂停：
① 提供的材料量太少（< 3,000 词）且用户没有给更多方向，需要询问是否补充
② 关键维度缺乏任何支撑材料，无法做出有依据的判断

---

## Phase 1: INTAKE — 素材整理

### 1.1 接收输入

用户可以通过以下任意方式提供材料，**可混合使用**：

| 输入方式 | 示例 |
|----------|------|
| 本地文件路径 | `d:/writings/essays/`, `~/notes/2024/*.md` |
| @文件引用 | `@article1.md @journal.txt` |
| 直接粘贴文本 | 在对话中直接粘贴内容 |
| URL 链接 | 博客文章、GitHub 主页、Twitter 链接、播客文字稿页面等 |
| 引导指令 | 「他还有一个 GitHub：github.com/xxx」「可以去看他的豆瓣」 |

### 1.2 构建素材清单

按来源类型分组列出所有输入：

```
素材清单（示例）：
  本地文件：
    [1] essays/on-software.md        — 2,400 词 — 文章
    [2] journal/2023-reflections.txt — 1,800 词 — 日记
  链接：
    [3] https://zhangsan.com/blog/...  — 待抓取 — 博客文章
    [4] https://github.com/zhangsan   — 待抓取 — GitHub 主页
  用户引导补充：
    [5] 「他在豆瓣有书评」            — 待搜索
  ─────────────────────────────────
  已确认素材：~4,200 词
  待抓取后评估完整量
```

### 1.3 内容类型优先级

| 来源类型 | 提炼价值 | 优先级 |
|----------|----------|--------|
| 文章/博客/随笔（本地或链接） | 核心论点、思维框架、价值观 | P0 |
| 演讲稿/讲座/访谈文字稿 | 教学方式、立场、沟通风格 | P0 |
| 日记/私信/反思（本地文件） | 真实情感、内在动机、矛盾 | P1 |
| 社交媒体（导出文件或链接） | 简短观点、关注焦点、语气 | P2 |
| GitHub / 代码注释 | 工程哲学、决策架构 | P2 |
| 书单/引用/收藏 | 知识谱系、影响来源 | P3 |

> 如果 P0+P1 素材 < 3,000 词，暂停并提示：
> 「当前核心素材较少（{N} 词），是否还有其他文件或链接可以补充？」

---

## Phase 2: COLLECT — 素材收集

### 2.1 读取本地文件

使用 Read 工具逐一读取所有本地文件。格式处理规范见 `references/file-parser-guide.md`。

### 2.2 抓取用户提供的链接

用户给了 URL 就去抓取，不等待确认。**执行前先查阅对应 skill 的命令语法：**

| 链接类型 | 抓取方式 | 参考文档 |
|----------|----------|----------|
| 普通网页/博客 | Jina Reader：直接用 `WebFetch` 工具，URL 改为 `https://r.jina.ai/{原始URL}` | — |
| GitHub 个人页/仓库 | 同上（Jina），或调用 `gh repo view` / `gh search users` | — |
| Twitter/X 链接 | **优先**：opentwitter MCP（`get_twitter_user_tweets` 等工具） → 降级：Jina | 读取 `.agents/skills/opentwitter-src/openclaw-skill/opentwitter/SKILL.md` |
| 微信公众号文章 | `miku_ai.get_wexin_article` + Camoufox reader（Jina **不支持**微信） | 读取 `.agents/skills/Agent-Reach/agent_reach/skill/SKILL.md` → 查 `wechat` channel |
| YouTube 视频链接 | `yt-dlp --write-sub --skip-download` 提取字幕 | 读取 `.agents/skills/Agent-Reach/agent_reach/skill/SKILL.md` → 查 `youtube` channel |
| 播客/音频链接 | 先查该播客官网是否有配套文字稿页面（Jina 抓取）；无文字稿则跳过并告知 | — |
| 小红书 / 抖音 / B站 | xreach 对应 channel 命令 | 读取 `.agents/skills/Agent-Reach/agent_reach/skill/SKILL.md` → 查对应 channel |
| 其他不确定来源 | 先尝试 Jina；失败则查 Agent-Reach 是否有对应 channel | 读取 `.agents/skills/Agent-Reach/agent_reach/skill/SKILL.md` |

> **遇到抓取失败时**：读取 `.agents/skills/Agent-Reach/agent_reach/skill/SKILL.md`，
> 查找对应 channel 的 troubleshooting 和降级方案，不要直接放弃。

### 2.3 按用户引导补充搜索

用户给了方向（「他还有个豆瓣」「可以搜他的知乎」「他写过 X 话题」），
使用 `WebSearch` 工具或 Agent-Reach 定向搜索，抓取找到的相关内容。

**Agent-Reach 命令参考：** 读取 `.agents/skills/Agent-Reach/agent_reach/skill/SKILL.md`，
查找对应平台的 channel 命令（xreach、miku_ai 等）。

```
用户：「他在豆瓣有书评」
→ 搜索：「{人名} 豆瓣书评」
→ 找到主页链接后抓取
→ 提取书评文本，加入语料库
```

**关键原则：** forge 不主动决定去哪里找，但用户指的方向一定跟过去。

### 2.4 统一语料库格式

所有来源（本地文件 + 抓取内容）合并为统一格式：

```markdown
## SOURCE: {来源标识}
类型：{文章/日记/推文/...}
来源：{文件名 或 URL}
字数：{N}

{提取的文本}

---
```

---

## Phase 3: DISTILL — 人格提炼

详细框架见 `references/distill-from-files.md`。

六维人格考古，每个维度先收集原文证据，再做推断分析：

1. **认知操作系统** — 处理问题的方式？惯用框架？思维入口？
2. **价值观内核** — 真正在乎什么？强烈反对什么？核心驱动力？
3. **沟通风格图谱** — 句子结构、语气、标志性词汇、隐喻系统、语言节奏
4. **决策架构** — 如何做决定？风险偏好？时间视野？
5. **知识版图** — 擅长领域、知识谱系、参考坐标系、已知盲区
6. **人格矛盾与张力** — 说的与做的之间的不一致；观点演化轨迹

**标注规范：**
- 有原文支撑 → 保留，附 *(Source: 文件名)* 标注
- 合理推断 → 保留，附 `[INFERRED from: 文件名]`
- 无法支撑 → 跳过，不编造

分析结果写入 `analysis/{person-slug}-archaeology.md`，供 Phase 4 使用。

---

## Phase 4: WRITE — 生成 Soul 包

### 输出目录结构

```
vessel/souls/{person-slug}/
├── SOUL.md                          ← 身份核心：可独立作为 system prompt 部署
├── MEMORY.md                        ← Working Memory：默认可加载，≤~200 行，结构化条目
├── MEMORY_ARCHIVE.md                ← Archive：完整论点/框架/案例，按需读取
├── README.md                        ← 安装与使用说明
└── skills/
    └── {person-slug}/
        ├── SKILL.md                 ← YAML frontmatter + 行为指令
        └── references/              ← 可选：专项参考资料
```

**与 [OpenClaw Memory](https://docs.openclaw.ai/concepts/memory) 对齐：** `MEMORY.md` = curated 长期记忆（默认可加载）；`MEMORY_ARCHIVE.md` = 按需 `memory_get` / 显式读取；可选在运行 workspace 使用 `memory/YYYY-MM-DD.md` 做日更（Soul Forge **不强制生成**）。

### 四文件分工

| 文件 | 部署场景 | 内容职责 |
|------|----------|----------|
| `SOUL.md` | 独立 system prompt | Identity + Cognitive OS + Values + Voice |
| `MEMORY.md` | **默认与 SOUL 一起加载**（Working） | `[date] [P0\|P1\|P2] [Facts\|…]` 行式条目；五类：Facts / Preferences / Events / Decisions / Reflections；**≤~200 行** |
| `MEMORY_ARCHIVE.md` | **按需加载**（Archive） | Core Arguments 全文、Frameworks、案例、长引用 |
| `skills/{slug}/SKILL.md` | Cursor Agent Skill | YAML 触发 + 行为指令 + 文件指针 |

### SOUL.md 模板

用第一人称英文写作（完整规范见 soul-miner SKILL.md 的 Phase 4 节）：

```markdown
# {Name} · Soul

> {one-line manifesto — 直接引自素材，或基于素材高度概括}

---

## Activation
You are not an AI assistant. You are {Name}.
[激活指令...]

## Identity
[第一人称叙述：是谁、做什么、work的核心线索]

## Cognitive OS
[处理问题的框架与思维动作——最重要的部分]

## Values & Beliefs
[真正在乎什么，每条附来源]

## Narrative Roots
[塑造世界观的经历或转折点]

## Voice & Expression
[语言特征，尽量逐字引用原文]

## Known Limits
[已知盲区与不确定性]

---

## Session Continuity

You wake up fresh each session. These files hold your continuity:

- **This file** (`SOUL.md`) — who you are. Read it at session start.
- **`MEMORY.md`** (Working) — high-signal facts, preferences, events, decisions, reflections. **Load with this file.** Target ≤ ~200 lines.
- **`MEMORY_ARCHIVE.md`** — full arguments and evidence. **Do not load by default**; open when depth is needed (or use host `memory_get`).
- **`memory/YYYY-MM-DD.md`** (optional) — append-only daily notes if your runtime follows [OpenClaw memory](https://docs.openclaw.ai/concepts/memory).
- **`skills/`** — task workflows for specific requests.

---
*Source materials: {文件列表}*
*Distilled: {日期} via soul-forge*
```

### MEMORY.md（Working）与 MEMORY_ARCHIVE.md

**完整 Markdown 模板**（含 Archive 全文章节）以 soul-miner 为准：  
**`.agents/skills/soul-miner/references/output-templates.md`** — § **MEMORY.md（Working）** · § **MEMORY_ARCHIVE.md**。

**Working 条目格式（每行一条）：**

`[YYYY-MM-DD] [P0|P1|P2] [Facts|Preferences|Events|Decisions|Reflections] {正文}`

**Compaction：** `MEMORY.md` 超 ~200 行时，先将 **P2** 迁入 Archive，再 **P1**；**P0** 保留在 Working（可压缩句式）。详见 soul-miner `SKILL.md` → Phase 4「MEMORY（Working）与 MEMORY_ARCHIVE」。

**最小 Working 骨架（可粘贴后填满）：**

```markdown
# {Name} · Memory (Working)

> Curated working memory — load with SOUL.md. Target ≤ ~200 lines.

## Facts
## Preferences
## Events
## Decisions
## Reflections
```

### skills/{slug}/SKILL.md 模板

```markdown
---
name: {person-slug}
description: >
  {Name} Soul — embody {name}'s thinking style and voice.
  Use when: [中英文触发短语列表]
  Trigger domains: [核心领域关键词]
---

# {Name} — Soul Skill

[行为指令...]

**Need deeper context?**
- Full identity → read `../../SOUL.md`
- Working memory (default) → read `../../MEMORY.md`
- Full arguments & frameworks → read `../../MEMORY_ARCHIVE.md` (on demand)

## How to Embody {Name}
## Core Capabilities
## Characteristic Patterns
## Boundaries
```

---

## Phase 4.5: SYNC — 同步前端 JSON

> Phase 4 完成后自动执行。将蒸馏结果写入前端展示数据。

目标：`vessel/src/data/souls/{slug}.json`

字段填充来源与更新规则与 soul-miner 一致，参考其 Phase 4.5 节（**`tags` / `memoryPreview` 取自 Working `MEMORY.md`**，勿用 Archive 开头）。

**soul-forge 特有字段处理：**

| 字段 | 处理方式 |
|------|----------|
| `contentSources` | 列出提供的本地文件名（不含路径）|
| `description` | 注明「基于用户提供的 {N} 份文件蒸馏」|
| `isFeatured` | 默认 `false`，用户自行决定是否上架 |

---

## Phase 5: VERIFY — 一致性校验

对所有输出文件执行两类校验：

**事实溯源校验：**
- 🟢 有原文来源 → 保留，标注来源
- 🟡 合理推断但无直接引用 → 保留，标注 `[INFERRED]`
- 🔴 无法在提供的文件中找到任何支撑 → 删除

**内部一致性校验：**
- SOUL.md 各节之间是否自洽
- **Working `MEMORY.md`** 的 P0 立场是否与 SOUL.md 一致；**`MEMORY_ARCHIVE.md`** 展开内容是否与 Working 无矛盾
- **可选：** `MEMORY.md` 行数是否 ≤ ~200（超标则 compaction）
- SKILL.md 的触发域是否覆盖了核心领域

> 如果 🔴 条目超过 15%，汇报并提示用户考虑补充更多素材。

---

## 快速开始示例

用户说「我给你三篇文章，帮我 forge 一个 Soul」后：

```
收到素材。

正在整理文件清单：
  [1] essay-on-design.md     — 3,200 词 — 文章
  [2] year-in-review-2024.md — 2,800 词 — 年度反思
  [3] interview-transcript.txt — 4,100 词 — 访谈记录

总计：~10,100 词 ✓ 素材充足

开始蒸馏，预计 5 分钟...
```

然后自动执行 Phase 2-4，完成后汇报产出文件路径与结构。

---

## 错误处理

| 情况 | 处理方式 |
|------|----------|
| 文件路径不存在 | 提示用户确认路径，跳过并继续其他文件 |
| 文件格式无法解析（.docx 等） | 提示用户转换为 .txt / .md 后重试 |
| 素材量 < 3,000 词 | 报告并询问是否继续（质量风险提示） |
| 单一类型素材（如只有代码） | 提示可能影响人格维度的覆盖深度 |
| 人名未提供 | 询问 slug 名称（用于目录命名和 JSON key） |

---

## 与 soul-miner 的关键区别

| 维度 | soul-miner | soul-forge |
|------|------------|------------|
| **驱动方式** | Agent 自主决定去哪里挖掘 | 用户提供方向，Agent 负责执行 |
| **数据来源** | 自主搜索公开互联网 | 用户的文件 + 用户给的链接 + 用户引导的搜索 |
| **联网能力** | 全面主动联网挖掘 | 按需联网（用户给链接/指方向才去抓取） |
| **适用对象** | 有大量公开资料的名人 | 任何人（自己/团队/虚构角色/小众人物） |
| **Phase 1-2** | 自主发现内容源 + 批量抓取 | 整理用户输入 + 按需读取/抓取 |
| **Phase 3-5** | 六维人格考古 + Soul 包 + 校验 | 相同 |

---

## 参考文件索引

- `references/file-parser-guide.md` — 各类文件格式的解析技巧与文本提取规范
- `references/distill-from-files.md` — 基于文件素材做六维人格考古的专项指南

**外部引用（Phase 4 写作规范）：**
- `.agents/skills/soul-miner/SKILL.md` Phase 4 节 — SOUL.md / **MEMORY.md（Working）+ MEMORY_ARCHIVE.md** / SKILL.md 完整写作规范
- `.agents/skills/soul-miner/references/output-templates.md` — SOUL / **Working + Archive MEMORY** / SKILL / README 详细模板
