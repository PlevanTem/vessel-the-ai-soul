# Vessel Landing Page

A premium AI identity landing page built with React + TypeScript + Vite.

**Design direction**: Ink Flow + Dark Philosophy — WebGL gold particle flow field background, editorial serif typography, dark amber/gold color system.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build tool**: Vite 6
- **Styling**: Tailwind CSS V4 (via `@theme` directive, no config file)
- **Animations**: Framer Motion (AnimatePresence, useInView, motion components)
- **Scroll**: Native smooth scroll + Intersection Observer for section tracking
- **Generative visuals**: WebGL2 flow field (custom, no library dependency)
- **Success animation**: Canvas 2D particle explosion

## Project Structure

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Root layout + routing (/ and /soul/:slug)
├── components/
│   ├── Navbar.tsx        # Fixed nav with scroll detection + mobile menu
│   ├── SoulGrid.tsx      # Soul listing grid with category filter
│   ├── Footer.tsx        # Brand footer
│   └── ...sections       # HeroSection, DemoSection, PricingSection, etc.
├── pages/
│   ├── HomePage.tsx      # Landing page
│   └── SoulDetailPage.tsx# Individual Soul detail + download
├── generative/
│   ├── AsciiBackground.tsx  # ASCII art generative background
│   ├── FlowField.tsx        # WebGL2 particle flow field canvas component
│   └── SuccessParticles.tsx # Canvas 2D success burst animation
├── hooks/
│   ├── useFlowField.ts   # WebGL2 flow field logic
│   └── useUtils.ts       # Typewriter + intersection observer utilities
├── data/
│   ├── index.ts          # Re-export entry (backwards compatible)
│   ├── souls.ts          # Data layer: registry + getSoulBySlug() + getAllSouls()
│   ├── HOW_TO_ADD_SOUL.md  # ← 新增 Soul 操作指南（必读）
│   └── souls/
│       ├── _index.json   # ← 所有 Soul 的轻量元数据（列表页/筛选用）
│       ├── naval-ravikant.json  # ← 完整 Soul 数据（详情页用）
│       └── {slug}.json   # ← 每个 Soul 一个独立文件
├── types/
│   └── index.ts          # TypeScript interfaces (Soul, SoulMeta, etc.)
└── styles/
    └── globals.css       # Tailwind V4 @theme tokens + base styles
```

## Adding a New Soul

Soul 数据完全由 JSON 文件驱动，不需要改业务代码。

**完整操作步骤见** → [`src/data/HOW_TO_ADD_SOUL.md`](src/data/HOW_TO_ADD_SOUL.md)

**速查（3 步）：**

1. 新建 `src/data/souls/{slug}.json`（完整 Soul 数据）
2. 在 `src/data/souls/_index.json` 追加轻量元数据
3. 在 `src/data/souls.ts` 加一行 import + 一行注册

新增一个 Soul 全程约 **2 分钟**，不碰任何 .tsx 文件。

## Data Architecture

```
SoulMeta（轻量）          Soul（完整）
_index.json  ────────→  {slug}.json
     ↓                       ↓
  列表页                   详情页
  分类筛选                 文件下载
  搜索                     对话展示
```

- `_index.json` — 仅含展示卡片所需的字段，保持轻量
- `{slug}.json` — 含 soulMd / conversations / capabilities 等完整字段，按需加载
- `souls.ts` — 注册表 + `getSoulBySlug()` / `getAllSouls()` / `soulIndex` 导出

## Key Features

- **WebGL2 flow field**: Gold particles driven by Perlin-like noise, responds to mouse
- **Soul detail pages**: `/soul/:slug` 路由，展示完整 Soul 文件 + 对话样本 + 下载
- **Category filtering**: 按领域筛选 Soul 列表
- **Typewriter effect**: Soul conversation answers type out character by character
- **Success particles**: Canvas 2D burst animation on waitlist submission
- **Fully responsive**: Mobile menu, responsive typography, mobile WebGL fallback
- **Accessible**: focus-visible styles, aria-hidden on decorative elements, prefers-reduced-motion
