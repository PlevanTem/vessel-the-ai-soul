# 项目目录与引用关系（必读）

本文档用于避免 **误删核心目录**、**双份源码不同步**、**Soul 数据与前端脱节**。

## 单一真相来源（Canonical）

| 用途 | 权威路径 | 说明 |
|------|-----------|------|
| **网站 / Vite 前端** | `vessel/` | `package.json`、`vite.config.ts`、`index.html`、`src/` 全部以 **`vessel/` 根** 为准。 |
| **Soul 列表数据（JSON）** | `vessel/src/data/souls/*.json` | `src/data/souls.ts` 通过 `import.meta.glob` **自动扫描** 该目录，无需手工注册表。 |
| **Soul 蒸馏包（Markdown）** | `vessel/souls/{slug}/` | `src/utils/bundledSouls.ts` 在构建时 `glob` **`vessel/souls/*/SOUL.md`** 等，供下载 ZIP 优先使用。 |

**结论：任何面向产品的修改，请只在 `vessel/` 下进行。**

## 核心引用链（不要断）

```
vessel/src/data/souls/{slug}.json   ←── 列表 / 详情元数据（slug 与文件名一致）
        │
        └── slug 应对应 ──→  vessel/souls/{slug}/SOUL.md（及 MEMORY.md、README.md、skills/…）
                                    ↑
                    bundledSouls.ts（../../souls/*/…）
```

- **`souls.ts`**：`./souls/[!_]*.json` → 每个合法 JSON 即一个 Soul。
- **`bundledSouls.ts`**：按路径解析 `slug`，与 JSON 的 `slug` **应一致**，否则下载包会缺正文。

## 根目录：不要再建第二套前端 / Soul 树

**已完成去重**：仓库根下 **不再跟踪** `src/`、`souls/` 及根级 `vite.config.ts` / `index.html` 等；这些内容 **只存在于 `vessel/`**。

- `.gitignore` 已忽略根目录的 `/src/`、`/souls/`，防止误加回重复副本。
- 若本地仍看到空文件夹，可手动删掉；以 `git status` 为准。

## 禁止类操作（给协作者 / AI）

未经人工明确确认，**不要**：

- 批量 `git rm` / 删除 **`vessel/src`**、**`vessel/souls`**、**`vessel/package.json`**、**`vessel/vite.config.ts`**。
- 以「去掉重复」为由删除 `vessel/` 下文件（`vessel/` 是产品根，不是「多余的第二份根目录」）。
- 只改 JSON 不改 `vessel/souls/{slug}/`，或只改 Markdown 不加/不改对应 JSON（会导致列表与下载内容不一致）。

## 提交前自检

在仓库根执行：

```bash
npm run verify
```

会校验：JSON 可解析、`slug`/`id` 与文件名一致、`vessel/souls/{slug}/SOUL.md` 是否存在、是否有「只有目录没有 JSON」的孤儿文件夹。

若某 Soul 仅为占位（尚未蒸馏 Markdown），会出现 **WARN**（缺少 `SOUL.md`），默认仍算通过；需要 CI/发布门禁时可使用 `npm run verify:strict`（任一 WARN 即失败）。

## 新增 Soul 检查清单

1. 新增 `vessel/src/data/souls/{slug}.json`（`slug` 与文件名一致）。
2. 新增 `vessel/souls/{slug}/`（至少 `SOUL.md`；建议 `MEMORY.md`、`README.md`、persona `skills/{slug}/SKILL.md`）。
3. 运行 `npm run verify`。
4. 详情见 `vessel/src/data/HOW_TO_ADD_SOUL.md`（路径相对于 **`vessel/`**）。

## 部署（Vercel）

**`vessel/` 须以普通目录形式存在于仓库中**（勿再使用无 `.gitmodules` 的 submodule gitlink，否则 Vercel 克隆后 `vessel` 为空、构建失败）。

详细步骤与控制台设置见 **[DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)**。根目录 **`vercel.json`**：`install` / `build` 在 `vessel/` 内执行，`outputDirectory` 为 **`vessel/dist`**。
