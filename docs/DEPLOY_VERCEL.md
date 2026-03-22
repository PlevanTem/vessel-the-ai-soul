# Vercel 部署说明

## 之前部署失败常见原因

仓库曾把 **`vessel/` 记成 git submodule（仅有 gitlink、无 `.gitmodules`）**。  
Vercel 克隆仓库后 **`vessel/` 目录是空的**，没有 `package.json`，构建必然失败。

当前已改为：**`vessel/` 作为普通目录提交进同一仓库**，克隆后即可安装依赖并构建。

## 推荐配置（项目根 = 仓库根）

在 Vercel 项目 **Settings → General**：

| 项 | 值 |
|----|-----|
| **Root Directory** | 留空 或 `.`（不要用 `vessel` 除非你刻意只部署子目录） |
| **Framework Preset** | 选 **Other**，或关闭「Override」让仓库根目录的 `vercel.json` 生效 |
| **Build Command** | 留空（使用 `vercel.json` 里的 `buildCommand`） |
| **Output Directory** | 留空（使用 `vercel.json` 里的 `outputDirectory`） |
| **Install Command** | 留空（使用 `vercel.json` 里的 `installCommand`） |

根目录 **`vercel.json`** 已设置：

- `framework: null` — 避免在仓库根误检测 Vite（根下没有 `vite.config.ts`）
- `installCommand` / `buildCommand` — 在 **`vessel/`** 内执行 `npm install` 与 `npm run build`
- `outputDirectory` — **`vessel/dist`**
- `rewrites` — SPA 回退到 `index.html`

若你在控制台里**手动填过** Build / Output / Install，请删掉或与上述一致，否则可能覆盖 `vercel.json`。

## 备选：Root Directory = `vessel`

若把 **Root Directory** 设为 **`vessel`**：

- Vercel 只会读取 **`vessel/vercel.json`**（仅含 SPA rewrites）
- 构建会使用默认 **`npm install`** + **`npm run build`**，输出 **`dist`**
- 此时可**删除或忽略**仓库根的 `vercel.json`，以免混淆（根目录文件在「子目录为根」时不会参与该项目的构建配置）

两种方式选一种即可，不要混用冲突的 Override。

## 环境变量

若应用使用 Supabase 等，在 Vercel **Environment Variables** 中配置与本地 `vessel/.env` 一致的变量（勿把 `.env` 提交进 Git）。
