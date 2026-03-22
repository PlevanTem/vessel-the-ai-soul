# 如何向 Vessel 网站添加新 Soul

> **Zero-Config 架构**：只需创建一个 JSON 文件，无需改任何代码。

> **目录约定**：本文件路径相对于 **`vessel/`**。权威说明见仓库根目录 **[docs/PROJECT_LAYOUT.md](../../../docs/PROJECT_LAYOUT.md)**。提交前可在仓库根执行 **`npm run verify`** 检查 JSON 与 `vessel/souls/{slug}/` 是否一致。

---

## 添加一个新 Soul（1 步）

在 `src/data/souls/` 目录下，新建 `{slug}.json`。

**保存后，Soul 自动出现在网站上。完成。**

---

## JSON 字段完整模板

```json
{
  "id": "{slug}",
  "slug": "{slug}",
  "name": "Full Name",
  "title": "Role / Description",
  "category": "AI & Engineering",
  "tags": ["tag1", "tag2"],
  "description": "一段话描述这个 Soul 的蒸馏内容和价值。",
  "version": "1.0.0",
  "downloads": 0,
  "rating": null,
  "reviews": 0,
  "lastUpdated": "YYYY-MM-DD",
  "isFeatured": false,
  "displayOrder": 99,
  "contentSources": [
    "来源 1 描述",
    "来源 2 描述"
  ],
  "soulTraits": [
    "最能代表此人的 4 个核心特质（一句话）"
  ],
  "triggerPhrases": [
    "\"适合问这个 Soul 的典型问题 1\"",
    "\"典型问题 2\""
  ],
  "capabilities": [
    "这个 Soul 擅长做什么（具体化）"
  ],
  "filePreview": "# Name · Soul\n\n## Identity\n...",
  "conversations": [
    {
      "question": "示例问题",
      "answer": "示例回答"
    }
  ],
  "soulMd": "SOUL.md 的完整内容（字符串，\\n 换行）",
  "skillMd": "SKILL.md 的完整内容（可选）",
  "memoryMd": "KNOWLEDGE.md 的完整内容（可选）"
}
```

---

## 字段说明

### 必填字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` / `slug` | string | URL 友好格式，如 `paul-graham`（两者相同） |
| `name` | string | 显示名称 |
| `title` | string | 职位/身份描述 |
| `category` | string | 见下方分类列表 |
| `tags` | string[] | 关键词标签 |
| `description` | string | 卡片描述文案 |
| `version` | string | 版本号，如 `1.0.0` |
| `downloads` | number | 下载量（初始可设 0） |
| `lastUpdated` | string | `YYYY-MM-DD` 格式 |
| `contentSources` | string[] | 原始素材来源列表 |
| `soulTraits` | string[] | 4 条核心人格特质 |
| `triggerPhrases` | string[] | 适合问这个 Soul 的问题示例 |
| `capabilities` | string[] | 能力描述列表 |
| `filePreview` | string | SOUL.md 前几段预览 |
| `conversations` | array | 至少 1 条问答样本 |

### 可选字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `displayOrder` | number | 排序权重，数字小的靠前（默认 999） |
| `isFeatured` | boolean | 是否展示 Featured 标签 |
| `rating` | number | 评分 0–5 |
| `reviews` | number | 评论数量 |
| `soulMd` | string | 完整 SOUL.md 内容，详情页下载用 |
| `skillMd` | string | 完整 SKILL.md 内容 |
| `memoryMd` | string | 完整 KNOWLEDGE.md 内容 |

---

## category 可选值（必须完全匹配）

```
"AI & Engineering"
"Startup & Investing"
"Philosophy & Writing"
"Science & Curiosity"
"Finance & Psychology"
```

---

## 排序控制

- `displayOrder` 越小，排列越靠前
- 没有 `displayOrder` 的按 `downloads` 降序排
- 当前顺序：Naval(1) → PG(2) → Karpathy(3) → Feynman(4) → ...

---

## 修改已有 Soul

直接编辑 `src/data/souls/{slug}.json`，保存即生效。不需要改任何其他文件。

---

## 文件结构

```
src/data/
├── souls/
│   ├── naval-ravikant.json   ← 每个 Soul 一个独立文件
│   ├── paul-graham.json
│   └── {slug}.json           ← 新建文件 → 自动注册
├── souls.ts                  ← 数据层（用 import.meta.glob 自动扫描，不需要手动改）
└── HOW_TO_ADD_SOUL.md        ← 本文件
```

---

## 快速检查清单

新建一个 Soul 后确认：

- [ ] 文件名格式正确：`{slug}.json`（小写，连字符分隔，与 id/slug 字段一致）
- [ ] JSON 格式正确（无语法错误）
- [ ] `category` 完全匹配预定义分类之一
- [ ] `conversations` 至少有 1 条
- [ ] 如需完整文件下载，`soulMd` 字段已填充
