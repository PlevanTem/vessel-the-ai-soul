<div align="center">

```
 ██╗   ██╗███████╗███████╗███████╗███████╗██╗
 ██║   ██║██╔════╝██╔════╝██╔════╝██╔════╝██║
 ██║   ██║█████╗  ███████╗███████╗█████╗  ██║
 ╚██╗ ██╔╝██╔══╝  ╚════██║╚════██║██╔══╝  ██║
  ╚████╔╝ ███████╗███████║███████║███████╗███████╗
   ╚═══╝  ╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝
```

**Distill a mind. Deploy it anywhere.**

*An open format for human intelligence — sourced, structured, and runnable as AI.*

[![License: CC BY 4.0](https://img.shields.io/badge/Souls-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![License: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](LICENSE)
[![Format](https://img.shields.io/badge/Format-SOUL.md-gold.svg)](#the-soul-format)

[Browse Souls](#souls) · [Quick Start](#quick-start) · [Developer setup](#developer-setup) · [Repo layout](docs/PROJECT_LAYOUT.md) · [Build a Soul](#building-a-soul) · [vessel.ai](https://vessel.ai)

</div>

---

## What is Vessel?

Vessel turns a person's public writing, interviews, and recorded talks into a deployable AI persona — called a **Soul** — that can be loaded into any AI tool to reason, argue, and communicate the way that person does.

```
Input: years of public thought, essays, talks, tweets
          ↓  Soul Miner pipeline  ↓
Output: SOUL.md + SKILL.md + MEMORY.md
```

These three files are plain Markdown. They work as a system prompt in Cursor, Claude, ChatGPT, or any AI tool. No API keys. No platform lock-in.

**What makes this different:**

Most "AI persona" tools summarize what a person said. Vessel captures *how* they think — their cognitive operating system, decision patterns, rhetorical moves, blind spots, and hard limits. The difference between a summary and a Soul is the difference between reading about a boxer and seeing them fight.

**What Vessel is not:**
- Not a digital clone or a replacement for the actual person
- Not trained on private data — public sources only
- Not a chatbot wrapper — it's a structured format anyone can use
- Not a hallucination engine — every claim is sourced, or marked `[INFERRED]`, or removed

---

## The Soul Format

Every Soul is three files, each with a distinct role:

| File | Layer | What it contains | How to use it |
|------|-------|-----------------|---------------|
| `SOUL.md` | Identity | Who they are, how they think, how they communicate, their red lines, their blind spots | Load as AI system prompt |
| `SKILL.md` | Capability | What they excel at, trigger phrases that unlock their best responses, anti-patterns, installation guide | Read before using |
| `MEMORY.md` | Knowledge | 15–20 core arguments with sources, signature frameworks, counterintuitive takes, intellectual influences, what they don't know | Add as context / RAG |

The format is open. If you can read Markdown, you can read — or write — a Soul.

---

## Souls

Distilled Markdown packages live under **`vessel/souls/{slug}/`**. The marketing site reads card copy from **`vessel/src/data/souls/*.json`** (same `slug`). See [docs/PROJECT_LAYOUT.md](docs/PROJECT_LAYOUT.md) for the full data flow.

| Person | Domain | Quality | Install |
|--------|--------|---------|---------|
| [Naval Ravikant](vessel/souls/naval-ravikant/) | Wealth · Happiness · Judgment | ★★★★★ | [→ README](vessel/souls/naval-ravikant/README.md) |
| [Sam Altman](vessel/souls/sam-altman/) | Startups · AGI · Compounding | ★★★★☆ | [→ README](vessel/souls/sam-altman/README.md) |
| [Andrej Karpathy](vessel/souls/andrej-karpathy/) | ML · Software 3.0 · Teaching | ★★★★★ | [→ README](vessel/souls/andrej-karpathy/README.md) |
| [Richard Feynman](vessel/souls/richard-feynman/) | Science · Teaching · First principles | ★★★★★ | [→ README](vessel/souls/richard-feynman/README.md) |
| [Steve Jobs](vessel/souls/steve-jobs/) | Product · Taste · Simplicity | ★★★★☆ | [→ README](vessel/souls/steve-jobs/README.md) |
| [Ryo Lu](vessel/souls/ryo-lu/) | Design · Systems · Soulful AI | ★★★★☆ | [→ README](vessel/souls/ryo-lu/README.md) |
| *Paul Graham* | *(catalog placeholder)* | — | — |
| *Derek Sivers* | *(catalog placeholder)* | — | — |
| *Morgan Housel* | *(catalog placeholder)* | — | — |

---

## Quick Start

**Deploy a Soul in under 2 minutes:**

```bash
# 1. Get the Naval Ravikant Soul
curl -O https://raw.githubusercontent.com/vessel-ai/vessel/main/vessel/souls/naval-ravikant/SOUL.md
```

**Cursor** — save as `.cursor/rules/naval-ravikant.md`

**Claude / Claude Code** — save as `CLAUDE.md`

**Any AI** — paste the contents as the system prompt

Now ask it:

```
"I work hard but can't seem to build real wealth. What am I missing?"
"Is it possible to be ambitious and at peace at the same time?"
"I feel like I'm playing the wrong game. How do I figure out which one I'm actually in?"
```

---

## What a Soul Looks Like

A glimpse into `vessel/souls/naval-ravikant/SOUL.md`:

```markdown
## What I Believe

- Wealth is assets that earn while you sleep. Everything else is renting out your time.
- Specific knowledge cannot be trained. It can only be pursued obsessively by the
  person who has it.
- Desire is a contract you make with yourself to be unhappy until you get what you want.
- The more outraged someone is, the worse their judgment.
- Code and media are the only leverage that doesn't require permission.
- Play stupid games, win stupid prizes.

## How I Communicate

Tone: Dense and aphoristic. I compress thinking into short sentences designed to land
and then keep working after they've been read.

What I never say: "It depends" without specifying on what. Vague moralizing. False
balance. Empty encouragement. "At the end of the day."
```

And from `vessel/souls/naval-ravikant/MEMORY.md`:

```markdown
### 1,000 Parallel Universes
A probabilistic framework for decision-making. Instead of "will this work?" ask
"in 1,000 parallel universe runs of this decision, what fraction work out well?"
You want to be wealthy in 999 of them, not just the best-case 50.
*(Source: nav.al/rich)*

### Permissionless vs. Permission Leverage
- Permission: labor, capital — requires others to say yes
- Permissionless: code, media — build it alone, works without you, indefinitely
The internet made permissionless leverage accessible to anyone. The game changed.
```

---

## Building a Soul

The **Soul Miner** is an automated 6-phase pipeline that discovers, extracts, and distills a person's public content into a Soul Package.

### Prerequisites

```bash
# Python 3.10+
pip install -r .agents/skills/soul-miner/requirements.txt
```

### Run the pipeline

```bash
# Phase 1 — Discover sources (blog, Twitter/X, YouTube, RSS, podcasts, GitHub)
python .agents/skills/soul-miner/scripts/discover.py "Paul Graham"

# Phase 2 — Extract content by quality tier
python .agents/skills/soul-miner/scripts/mine.py sources_discovered.json --output raw_content.json

# Phase 3–6 — Distill into Soul files
python .agents/skills/soul-miner/scripts/distill.py raw_content.json --output paul-graham/
```

Or load `.agents/skills/soul-miner/SKILL.md` into your AI agent and say:

```
Mine Paul Graham's Soul.
```

The agent runs all six phases automatically and only pauses at genuine uncertainty.

### The Pipeline

```
Phase 1  DISCOVER  ─── Search 10+ platforms for source content
Phase 2  MINE      ─── Extract, prioritize, and clean raw material
Phase 3  DISTILL   ─── 6-dimension personality archaeology
Phase 4  WRITE     ─── Generate Soul files in first person
Phase 5  VERIFY    ─── 3-tier fact-check: source every claim or remove it
Phase 6  TEST      ─── 20-question style fidelity test (≥ 15/20 to ship)
```

#### Source Quality Tiers

| Tier | Sources | Why |
|------|---------|-----|
| P0 — First-Hand Writing | Blog posts, newsletters, books, long threads | Deliberate, considered expression |
| P1 — Spoken Content | Podcast transcripts, talks, interviews | Natural voice, off-the-cuff thinking |
| P2 — Short-Form | Tweets, HN comments, brief responses | Statistical patterns across a corpus |
| P3 — Secondary (caution) | Articles *about* them, Wikipedia | Context only, never for attributing views |

Minimum viable Soul: **10,000 words** of P0+P1 material. Under 3,000 words, the pipeline pauses.

#### The 6-Dimension Analysis

Every Soul is built from six angles:

1. **Cognitive OS** — How do they decompose problems? First principles, systems thinking, historical analogy?
2. **Value Core** — What do they deeply care about? What makes them angry? Where do they think everyone else is wrong?
3. **Communication Style** — Sentence structure, rhythm, signature rhetorical moves, what they *never* say
4. **Decision Architecture** — How do they handle uncertainty? What's their risk profile? Time horizon?
5. **Knowledge Map** — Deep expertise domains, cross-domain transfer patterns, intellectual lineage
6. **Tensions & Blind Spots** — Contradictions, evolution over time, what they don't see well

#### Authenticity Enforcement

| Label | Meaning |
|-------|---------|
| *(Source: X)* | Direct quote or clear paraphrase from a specific source |
| `[INFERRED from: X, Y]` | Reasoned conclusion supported by multiple sources |
| *removed* | Couldn't be verified — deleted, not hedged |

A Soul with more than 10% unverifiable claims is rejected. There is no "probably" category.

---

## Repository Structure

**Single source of truth for the web app and Soul packages: `vessel/`.**  
The repo root holds docs, agent skills, and thin npm scripts — **no duplicate `src/` or `souls/` at the root** (see [docs/PROJECT_LAYOUT.md](docs/PROJECT_LAYOUT.md)). **Change log / incident notes:** [docs/PROJECT_LOG.md](docs/PROJECT_LOG.md).

```
.                                # Workspace root
├── package.json                 # npm scripts only → delegate to vessel/ (no duplicate deps)
├── vercel.json                  # If deploy root = repo: build output from vessel/dist
├── docs/
│   ├── PROJECT_LAYOUT.md        # Canonical paths, Soul JSON ↔ Markdown rules, verify
│   ├── PROJECT_LOG.md           # Bug / fix / update log (append on each relevant merge)
│   └── DEPLOY_VERCEL.md         # Vercel root dir & overrides
├── scripts/
│   └── verify-soul-integrity.mjs
├── vessel/                      # ★ Landing + Soul catalog (React / Vite app)
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── src/
│   │   ├── data/souls/*.json    # Site cards & detail metadata (glob-loaded)
│   │   └── utils/bundledSouls.ts # Bundles vessel/souls/*/SOUL.md at build time
│   ├── souls/
│   │   ├── naval-ravikant/      # SOUL.md + MEMORY.md + skills/
│   │   ├── sam-altman/
│   │   ├── andrej-karpathy/
│   │   └── {person-slug}/
│   │       ├── SOUL.md
│   │       ├── MEMORY.md
│   │       ├── README.md
│   │       └── skills/
│   └── templates/               # Blank templates for new Souls (if present)
│
├── .agents/skills/soul-miner/   # Soul Miner pipeline (Python)
│   ├── SKILL.md
│   ├── scripts/
│   │   ├── discover.py
│   │   ├── mine.py
│   │   ├── distill.py
│   │   └── run.py
│   └── references/
│       ├── source-priority.md
│       ├── soul-archaeologist.md
│       ├── output-templates.md
│       ├── authenticity-checker.md
│       └── dialogue-tester.md
│
└── reports/                     # Strategy & research (optional)
    ├── 01_pm/
    └── 02_designer/
```

---

## Contributing a Soul

The catalog grows by contribution.

**To submit a Soul:**

1. Run Soul Miner on your subject — ensure ≥ 10,000 words of P0+P1 material
2. Verify authenticity (Phase 5 — check that 🔴 claims are under 10%)
3. Run the dialogue test (Phase 6 — score ≥ 15/20)
4. Place output in `vessel/souls/{person-slug}/`
5. To list the Soul on the site, add `vessel/src/data/souls/{person-slug}.json` (see `vessel/src/data/HOW_TO_ADD_SOUL.md`)
6. Run `npm run verify` from the repo root before opening a PR
7. Open a PR with a brief note on source quality and material volume

**Contribution guidelines (PR checklist):**
- Public figures only, with substantial public writing or speaking records
- No fabrication — if you can't source it, mark it `[INFERRED]` or remove it
- Living private individuals require their explicit consent
- All Soul files are released under CC BY 4.0

---

## Developer setup

The **product frontend** lives entirely in **`vessel/`**: React 19, TypeScript, Vite, Tailwind v4, Framer Motion, plus generative canvas layers.

| What | Where |
|------|--------|
| Soul card / detail JSON | `vessel/src/data/souls/{slug}.json` |
| Distilled Markdown packages | `vessel/souls/{slug}/` |
| Layout & invariants | [docs/PROJECT_LAYOUT.md](docs/PROJECT_LAYOUT.md) |

```bash
# Install deps (run inside vessel)
cd vessel && npm install

# Dev server — from repo root (forwards to vessel)
cd ..   # back to repo root if needed
npm run dev
# → http://localhost:5173

# Optional: integrity check (JSON ↔ vessel/souls folders, core files present)
npm run verify
npm run verify:strict   # fail on warnings (e.g. missing SOUL.md for a slug)
```

**Deploy (Vercel):** See **[docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md)** (submodule / Root Directory / dashboard overrides). Root `vercel.json` builds from `vessel/` → `vessel/dist`.

**Add a Soul to the site:** see `vessel/src/data/HOW_TO_ADD_SOUL.md` (paths relative to `vessel/`).

---

## Why This Exists

Print made thought *copyable*.
The internet made thought *transmissible*.
Vessel is a bet that the next step is thought becoming *runnable*.

You can read Marcus Aurelius but you can't ask him about your specific situation. You can study Feynman but you can't run your paper by him. The gap between "their words on a page" and "their reasoning applied to your problem" is the gap Vessel closes.

The Soul format is designed to be:

- **Verifiable** — every claim traceable to a source, no exceptions
- **Portable** — plain Markdown, works with any AI model, today and in the future
- **Honest** — explicit about limits, blind spots, temporal cutoffs, and what was inferred
- **Durable** — the same files that work with Claude 3 should work with whatever comes next

The deeper goal is not to simulate people. It's to build a new kind of intellectual inheritance — one that's interactive, honest about its limits, and available to anyone.

---

## Roadmap

- [ ] `vessel install naval-ravikant` — CLI for one-command Soul deployment
- [ ] Soul registry with quality scores, source citations, and version history
- [ ] Chinese-language Soul pipeline (微信公众号, Bilibili, 小红书, 抖音)
- [ ] Automated Soul refresh pipeline — detects source updates, triggers re-distillation
- [ ] Soul pairing API — combine multiple Souls for multi-perspective reasoning
- [ ] vessel.ai — hosted catalog + custom Soul commissions for professionals

---

## License

Soul files: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
Source code: [MIT](LICENSE)

All Souls are built from public content only. Vessel is not affiliated with any distilled person. This is transformative analytical work — the same tradition as biographies, intellectual portraits, and oral history.

---

<div align="center">

*Vessel · vessel.ai · 2026*

</div>
