# 工程日志（Bug / 修复 / 更新）

本文件记录本仓库 **已发生的问题、根因、修复与结构性更新**。  
**约定**：以后每次合并与线上相关的 bugfix、回滚、部署、目录/数据结构调整，请在本文件顶部 **追加一条**（保持从新到旧），便于排查与 onboarding。

---

## 如何写一条记录

在下方 **`## [未发布]`** 或按日期建小节，使用下面模板（可复制）：

```markdown
### YYYY-MM-DD — 简短标题

| 字段 | 内容 |
|------|------|
| **类型** | `bugfix` / `fix` / `chore` / `feature` / `docs` |
| **影响** | 用户可见 / 仅开发部署 / 数据与 Soul |
| **摘要** | 一句话 |
| **根因** | （可选） |
| **改动** | 文件或目录要点；相关 commit 可写 hash 或 `chore: xxx` |
| **验证** | 如：`npm run verify`、Vercel 部署成功 |
```

---

## 历史记录

### 2026-03-22 — 将 `vessel/` 从 submodule gitlink 改为普通目录（修复 Vercel 空目录）

| 字段 | 内容 |
|------|------|
| **类型** | `fix`（部署） |
| **影响** | 仅开发部署 |
| **摘要** | 克隆后 `vessel/` 为空导致 Vercel 无法 `npm install` / build。 |
| **根因** | 父仓库仅记录 `vessel` 为 **git submodule（160000）**，且无有效 **`.gitmodules`**；远程克隆不包含子模块内容。 |
| **改动** | 移除 gitlink，删除 `vessel/.git`，将 **`vessel/` 整树纳入同一仓库**；根 **`vercel.json`** 设 `framework: null`，`install`/`build` 在 `vessel/`，`outputDirectory`: `vessel/dist`；新增 **`docs/DEPLOY_VERCEL.md`**。 |
| **验证** | 推送后 Vercel 使用仓库根配置应能完成构建。 |

---

### 2026-03-22 — 仓库根目录与 `vessel/` 去重

| 字段 | 内容 |
|------|------|
| **类型** | `chore` |
| **影响** | 开发体验、Git 结构 |
| **摘要** | 去掉根目录重复的 `src/`、`souls/` 及根级 Vite 配置文件，**唯一权威在 `vessel/`**。 |
| **根因** | 历史迁移导致根与 `vessel` 双份树，易改错、易漂移。 |
| **改动** | `git rm` 根 `src/`、`souls/`、`index.html`、`package-lock.json`、`tsconfig.json`、`vite.config.ts`；根 **`package.json`** 仅保留转发脚本；**`.gitignore`** 增加 `/src/`、`/souls/`。 |
| **验证** | `npm run dev` 在仓库根；`npm run verify`。 |

---

### 2026-03-22 — 防误删与 Soul 数据自检

| 字段 | 内容 |
|------|------|
| **类型** | `chore` + `docs` |
| **影响** | 开发规范、CI 可扩展 |
| **摘要** | 文档化目录约定；增加校验脚本与 Cursor 规则，降低再次误删 `vessel` 核心树的风险。 |
| **改动** | **`docs/PROJECT_LAYOUT.md`**；**`scripts/verify-soul-integrity.mjs`** + 根 **`package.json`** 的 `verify` / `verify:strict`**；**`.cursor/rules/vessel-project-guardrails.mdc`**。 |
| **验证** | `npm run verify`（占位 Soul 无 `SOUL.md` 时为 WARN 属预期）。 |

---

### 2026-03-22（早前）— 误删 `vessel` 内前端与部分 Soul 后的恢复

| 字段 | 内容 |
|------|------|
| **类型** | `bugfix`（事故恢复） |
| **影响** | 用户可见（站点白屏 / Soul 缺失） |
| **摘要** | 提交 **`005b9b0`** 在 **`vessel` 根** 误删 **`src/`**、**`souls/`**（含 Sam Altman、Naval、Karpathy 等）及构建配置。 |
| **根因** | 将「去掉父仓库重复前端」误执行在 **`vessel` 自身根目录**。 |
| **改动** | 从 **`005b9b0` 之前** 提交恢复树；**`steve-jobs.json`** 保留 **JSON 内双引号转义** 修复，避免 `filePreview` 破坏 JSON 解析（Vite 白屏）。 |
| **验证** | 本地 `npm run dev`；全量 soul JSON `JSON.parse`。 |

---

## [未发布]

<!-- 新记录请写在这里（或新建 ### YYYY-MM-DD 小节），合并发布后再移到「历史记录」 -->

---

## 相关文档

- [PROJECT_LAYOUT.md](./PROJECT_LAYOUT.md) — 目录与引用关系  
- [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) — Vercel 部署与控制台设置  
- [../README.md](../README.md) — 仓库总览与 Developer setup  
