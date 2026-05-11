#!/usr/bin/env python3
"""
Soul Miner — End-to-End Runner
用法: python run.py "Paul Graham" [--known-urls "url1,url2"] [--output-dir ./souls]

这是完整流水线的入口脚本，按顺序执行 Phase 1-3，
并准备好供 AI Agent 完成 Phase 4（实际写作）。
"""

import sys
import subprocess
import argparse
import json
from pathlib import Path
import re


def slugify(name: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def run_step(label: str, cmd: list[str], cwd: str = ".") -> tuple[bool, str]:
    """执行一个步骤并返回 (success, output)"""
    print(f"\n{'─'*50}")
    print(f"▶ {label}")
    print(f"{'─'*50}")
    try:
        result = subprocess.run(
            cmd, capture_output=False, text=True,
            cwd=cwd, timeout=120
        )
        return result.returncode == 0, ""
    except subprocess.TimeoutExpired:
        print(f"  ⚠️  Step timed out after 120s")
        return False, "timeout"
    except Exception as e:
        print(f"  ✗ Step failed: {e}")
        return False, str(e)


def main():
    parser = argparse.ArgumentParser(
        description="Soul Miner — Full pipeline runner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run.py "Paul Graham"
  python run.py "Naval Ravikant" --known-urls "https://nav.al,https://twitter.com/naval"
  python run.py "李笑来" --chinese --output-dir ./souls
        """
    )
    parser.add_argument("name", help="Person's full name (e.g., 'Paul Graham')")
    parser.add_argument("--known-urls", default="", help="Comma-separated URLs you already know")
    parser.add_argument("--output-dir", default="./souls", help="Where to write the Soul files")
    parser.add_argument("--chinese", action="store_true", help="Include Chinese platform search")
    parser.add_argument("--skip-discover", action="store_true", help="Skip Phase 1 (use existing sources_discovered.json)")
    parser.add_argument("--skip-mine", action="store_true", help="Skip Phase 2 (use existing raw_content.json)")
    args = parser.parse_args()

    name = args.name
    slug = slugify(name)
    scripts_dir = Path(__file__).parent

    # Work in a temp directory for this person
    work_dir = Path("/tmp") / f"soul-miner-{slug}"
    work_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n🚀 Soul Miner starting for: {name}")
    print(f"   Working directory: {work_dir}")
    print(f"   Output directory: {args.output_dir}")

    # ── Phase 1: Discover ──────────────────────────────────────────
    if not args.skip_discover:
        discover_cmd = [
            sys.executable, str(scripts_dir / "discover.py"),
            name,
            "--output", str(work_dir / "sources_discovered.json")
        ]
        if args.known_urls:
            discover_cmd += ["--known-urls", args.known_urls]
        if args.chinese:
            discover_cmd += ["--chinese"]

        ok, _ = run_step("Phase 1: Discovering content sources", discover_cmd)
        if not ok:
            print("⚠️  Discovery phase had issues, continuing anyway...")

        # Check quality
        sources_file = work_dir / "sources_discovered.json"
        if sources_file.exists():
            data = json.loads(sources_file.read_text())
            if data.get("quality_assessment") == "insufficient":
                print("\n⚠️  WARNING: Limited sources found.")
                if args.known_urls:
                    print("   Continuing with available content...")
                else:
                    print("   TIP: Try adding --known-urls to point to known content sources")
                    print("   Example: --known-urls 'https://paulgraham.com,https://twitter.com/paulg'")
    else:
        print("\n⏭  Skipping Phase 1 (using existing sources_discovered.json)")

    # ── Phase 2: Mine ──────────────────────────────────────────────
    if not args.skip_mine:
        mine_cmd = [
            sys.executable, str(scripts_dir / "mine.py"),
            str(work_dir / "sources_discovered.json"),
            "--output", str(work_dir / "raw_content.json")
        ]

        ok, _ = run_step("Phase 2: Mining content from sources", mine_cmd)
        if not ok:
            print("⚠️  Mining phase had issues, continuing with available content...")
    else:
        print("\n⏭  Skipping Phase 2 (using existing raw_content.json)")

    # ── Phase 3: Prepare distillation ─────────────────────────────
    distill_cmd = [
        sys.executable, str(scripts_dir / "distill.py"),
        str(work_dir / "raw_content.json"),
        "--output-dir", args.output_dir
    ]

    ok, _ = run_step("Phase 3: Preparing distillation context", distill_cmd)

    # Move distillation files to work dir
    for fname in ["distillation_context.md", "distillation_job.json"]:
        src = Path(".") / fname
        if src.exists():
            src.rename(work_dir / fname)

    # ── Summary ────────────────────────────────────────────────────
    print(f"\n{'='*50}")
    print(f"✅ Pipeline Phase 1-3 Complete!")
    print(f"{'='*50}")
    print(f"\n📁 Work files: {work_dir}/")
    print(f"   · sources_discovered.json  — discovered content sources")
    print(f"   · raw_content.json         — extracted content corpus")
    print(f"   · distillation_context.md  — analysis prompt for AI")
    print(f"   · distillation_job.json    — job specification")

    # Show raw content stats
    raw_file = work_dir / "raw_content.json"
    if raw_file.exists():
        data = json.loads(raw_file.read_text())
        words = data.get("estimated_words", 0)
        sources = data.get("total_sources_succeeded", 0)
        print(f"\n📊 Content extracted:")
        print(f"   · Sources: {sources}")
        print(f"   · Est. words: {words:,}")

    print(f"\n{'─'*50}")
    print(f"🤖 NEXT STEP — AI Agent Phase 4")
    print(f"{'─'*50}")
    print(f"Read {work_dir}/distillation_context.md")
    print(f"Then generate and write:")
    print(f"  · {args.output_dir}/{slug}/SOUL.md")
    print(f"  · {args.output_dir}/{slug}/SKILL.md")
    print(f"  · {args.output_dir}/{slug}/MEMORY.md")
    print(f"  · {args.output_dir}/{slug}/README.md")
    print(f"\nUse the templates in references/output-templates.md")
    print(f"Follow the framework in references/soul-archaeologist.md")


if __name__ == "__main__":
    main()
