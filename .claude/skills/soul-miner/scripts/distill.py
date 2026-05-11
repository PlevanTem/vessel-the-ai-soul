#!/usr/bin/env python3
"""
Soul Miner — Phase 3+4: Distill + Write
读取 raw_content.json，调用 Claude（或在 agent 环境中直接分析），
生成 SOUL.md / SKILL.md / MEMORY.md 三文件。

在 Cursor Agent 环境中，这个脚本负责：
1. 将 raw_content.json 整理成清晰的分析输入
2. 输出结构化的 distillation_context.md（给 AI Agent 做人格分析用）
3. 写入最终的三个文件

实际的 AI 分析由调用本脚本的 Agent 完成。
"""

import sys
import json
import re
import argparse
from pathlib import Path
from datetime import datetime


def slugify(name: str) -> str:
    """把人名转成 slug，如 'Paul Graham' -> 'paul-graham'"""
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def extract_text_corpus(raw_content: dict) -> str:
    """
    从 raw_content.json 中提取所有文本，合并成单一语料。
    按来源优先级排列，高质量内容在前。
    """
    corpus_parts = []
    person_name = raw_content.get("person_name", "Unknown")

    for source in raw_content.get("sources_mined", []):
        source_type = source.get("source_type", "")
        url = source.get("url", "")
        header = f"\n\n{'='*60}\nSOURCE: {source_type.upper()} — {url}\n{'='*60}\n"

        if source_type == "website":
            # 网站文章
            for article in source.get("articles", []):
                corpus_parts.append(header + f"Article: {article.get('url', '')}\n\n" +
                                   article.get("content", ""))
        elif source_type == "rss":
            for article in source.get("articles", []):
                corpus_parts.append(header + f"Title: {article.get('title', '')}\n\n" +
                                   article.get("content", ""))
        elif source_type == "twitter":
            tweets_text = "\n".join(
                f"[{t.get('date', '')}] {t.get('text', '')}"
                for t in source.get("tweets", [])
            )
            if tweets_text:
                corpus_parts.append(header + tweets_text)
        elif source_type == "youtube":
            corpus_parts.append(header + f"Video: {source.get('title', '')}\n\n" +
                               source.get("transcript", ""))
        elif source_type == "github":
            text = source.get("profile_readme", "") or source.get("bio", "")
            if text:
                corpus_parts.append(header + text)
        else:
            # Generic
            content = source.get("content", "")
            if content:
                corpus_parts.append(header + content)

    return "\n".join(corpus_parts)


def build_distillation_prompt(person_name: str, corpus: str) -> str:
    """
    构建给 AI Agent 的分析提示词。
    这个 prompt 由 Agent 在 Cursor 环境中执行，进行深度人格分析。
    """
    word_count = len(corpus.split())

    return f"""# Soul Distillation Task: {person_name}

## Source Material Summary
- Person: {person_name}
- Word count: ~{word_count:,} words
- Material collected: {datetime.now().strftime('%Y-%m-%d')}

## Your Task
Analyze all the source material below and generate three files:

### File 1: SOUL.md (Identity Layer)
Capture WHO this person is — their cognitive operating system, core beliefs, 
communication style, decision principles, red lines, and known blind spots.
Write entirely in first person ("I"), in English.
Every claim must be grounded in the source material.
Mark inferred conclusions with [INFERRED].

Structure:
```
# {person_name} · Soul
> [one line in their voice, capturing their essential nature]
> *Distilled by Vessel · vessel.ai*

## Identity
## How I Think  
## What I Believe
## How I Communicate
## How I Decide
## What I Refuse
## My Blind Spots
```

### File 2: SKILL.md (Capability Layer)  
Capture WHAT this person is best at deploying as an AI persona.
What tasks should users give this Soul? What are the trigger phrases?
What's the ideal/worst use case?

Structure:
```
# {person_name} · Skill
> *Distilled by Vessel · vessel.ai*

## Best At
## Trigger Phrases (10-15 specific prompts that work well)
## Use Cases
## Anti-Patterns (what this Soul should NOT be used for)
## Installation
## Pairing Recommendations
```

### File 3: MEMORY.md (Knowledge Layer)
Capture WHAT this person knows and believes — their intellectual arsenal.
Core arguments (with sources), signature frameworks, counterintuitive takes,
key topic positions, case studies they return to, intellectual influences.

Structure:
```
# {person_name} · Memory
> *Distilled by Vessel · vessel.ai*

## Core Arguments (top 10-15)
## Signature Frameworks  
## Counterintuitive Takes
## Positions on Key Topics (table format)
## Case Studies & Examples
## Intellectual Influences
## What This Soul Doesn't Know
```

---

## Source Material

{corpus[:40000]}
"""


def write_output_files(person_name: str, soul_md: str, skill_md: str, memory_md: str,
                       output_dir: Path):
    """写入三个文件"""
    slug = slugify(person_name)
    person_dir = output_dir / slug
    person_dir.mkdir(parents=True, exist_ok=True)

    # Write files
    (person_dir / "SOUL.md").write_text(soul_md, encoding="utf-8")
    (person_dir / "SKILL.md").write_text(skill_md, encoding="utf-8")
    (person_dir / "MEMORY.md").write_text(memory_md, encoding="utf-8")

    # Write README
    readme = f"""# {person_name} · Vessel Soul Package

This Soul was distilled by [Vessel](https://vessel.ai) from public content.

## Files

| File | Purpose | Load as |
|------|---------|---------|
| `SOUL.md` | Identity — who they are, how they think | System prompt |
| `SKILL.md` | Capabilities — what they do best, trigger phrases | Reference |
| `MEMORY.md` | Knowledge — arguments, frameworks, positions | Knowledge base |

## Quick Start

Paste `SOUL.md` as your AI system prompt in:
- **Cursor**: `.cursor/rules/{slug}.md`
- **Claude**: `CLAUDE.md` 
- **Any AI**: System prompt field

## Vessel CLI (coming soon)

```bash
vessel install {slug}
```

---

*Built from public content only. No affiliation with {person_name}.*
*Distilled by Vessel · vessel.ai · {datetime.now().year}*
"""
    (person_dir / "README.md").write_text(readme, encoding="utf-8")

    return person_dir


def main():
    parser = argparse.ArgumentParser(description="Prepare distillation context and write Soul files")
    parser.add_argument("raw_content_file", help="Path to raw_content.json")
    parser.add_argument("--output-dir", default=".", help="Directory to write Soul files")
    parser.add_argument("--context-only", action="store_true",
                        help="Only output distillation_context.md (for manual AI analysis)")
    args = parser.parse_args()

    raw_path = Path(args.raw_content_file)
    if not raw_path.exists():
        print(f"Error: {args.raw_content_file} not found")
        sys.exit(1)

    raw_content = json.loads(raw_path.read_text(encoding="utf-8"))
    person_name = raw_content.get("person_name", "Unknown")
    slug = slugify(person_name)

    print(f"\n🧬 Preparing distillation for: {person_name}")
    print("=" * 50)

    # Extract and assemble corpus
    print("  · Assembling text corpus...")
    corpus = extract_text_corpus(raw_content)
    word_count = len(corpus.split())
    print(f"  · Total corpus: ~{word_count:,} words")

    # Build the distillation prompt
    prompt = build_distillation_prompt(person_name, corpus)

    # Save distillation context (for AI Agent to read and execute)
    context_file = Path("distillation_context.md")
    context_file.write_text(prompt, encoding="utf-8")
    print(f"  ✓ Distillation context saved: distillation_context.md")

    if args.context_only:
        print("\n📋 Context-only mode. Read distillation_context.md to generate Soul files.")
        print("   The AI Agent will now analyze the material and write SOUL.md, SKILL.md, MEMORY.md")
        return

    # In agent mode, the calling agent should now:
    # 1. Read distillation_context.md
    # 2. Perform the analysis according to the prompt
    # 3. Call write_soul_files() with the results
    # This script provides the scaffold; the actual generation happens in the agent loop.

    output_dir = Path(args.output_dir)
    person_dir = output_dir / slug
    person_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n📁 Output directory prepared: {person_dir}")
    print(f"\n🤖 Ready for AI analysis. The agent should:")
    print(f"   1. Read: distillation_context.md")
    print(f"   2. Generate SOUL.md, SKILL.md, MEMORY.md according to the templates")
    print(f"   3. Write files to: {person_dir}/")
    print(f"\n   Expected files:")
    print(f"   · {person_dir}/SOUL.md")
    print(f"   · {person_dir}/SKILL.md")
    print(f"   · {person_dir}/MEMORY.md")
    print(f"   · {person_dir}/README.md")

    # Write a job file so the agent knows exactly what to do
    job = {
        "task": "soul_distillation",
        "person_name": person_name,
        "slug": slug,
        "output_dir": str(person_dir),
        "context_file": "distillation_context.md",
        "files_to_write": ["SOUL.md", "SKILL.md", "MEMORY.md", "README.md"],
        "corpus_word_count": word_count,
        "status": "pending_ai_analysis"
    }
    Path("distillation_job.json").write_text(
        json.dumps(job, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"\n   Job spec saved: distillation_job.json")


if __name__ == "__main__":
    main()
