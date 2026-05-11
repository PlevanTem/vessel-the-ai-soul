#!/usr/bin/env python3
"""
Soul Miner — Phase 1: Content Source Discovery
给定一个人名，自动发现该人物的所有公开内容源。
输出：sources_discovered.json
"""

import sys
import json
import re
import subprocess
import argparse
from pathlib import Path
from datetime import datetime

# ──────────────────────────────────────────────
# Utilities
# ──────────────────────────────────────────────

def jina_fetch(url: str, timeout: int = 20) -> str:
    """用 Jina Reader 抓取任意网页内容"""
    try:
        result = subprocess.run(
            ["curl", "-s", "--max-time", str(timeout), f"https://r.jina.ai/{url}"],
            capture_output=True, text=True, timeout=timeout + 5
        )
        return result.stdout.strip()
    except Exception as e:
        return f"[FETCH_ERROR: {e}]"


def web_search(query: str, num: int = 5) -> list[dict]:
    """
    使用 WebSearch 工具搜索（在 Cursor Agent 环境中会自动调用内置搜索）
    这里提供命令行降级：抓取 DuckDuckGo HTML 并解析链接
    """
    try:
        encoded = query.replace(" ", "+")
        html = jina_fetch(f"https://html.duckduckgo.com/html/?q={encoded}")
        # 简单提取链接
        urls = re.findall(r'https?://(?!duckduckgo)[^\s"<>]+', html)
        unique = list(dict.fromkeys(urls))[:num]
        return [{"url": u, "title": "", "snippet": ""} for u in unique]
    except Exception:
        return []


def log(msg: str):
    print(f"  {'.' * 3} {msg}", flush=True)


# ──────────────────────────────────────────────
# Source Discovery Functions
# ──────────────────────────────────────────────

def discover_personal_website(name: str) -> list[dict]:
    """搜索个人网站和博客"""
    log(f"Searching personal website for {name}...")
    results = []

    # 直接搜索
    queries = [
        f"{name} personal website blog",
        f"{name} site:.com essays writing",
        f'"{name}" blog',
    ]
    for q in queries[:2]:
        hits = web_search(q, num=5)
        for h in hits:
            url = h.get("url", "")
            # 过滤掉社交媒体和新闻聚合
            skip = ["twitter.com", "linkedin.com", "youtube.com", "reddit.com",
                    "wikipedia.org", "news.ycombinator.com", "medium.com/@"]
            if not any(s in url for s in skip):
                results.append({
                    "type": "website",
                    "url": url,
                    "priority": "P0",
                    "notes": "Personal website / blog candidate"
                })

    return results[:3]


def discover_twitter(name: str) -> list[dict]:
    """发现 Twitter/X 账号"""
    log(f"Finding Twitter/X handle for {name}...")

    slug = name.lower().replace(" ", "").replace("-", "")
    slug2 = name.lower().split()[0] + name.lower().split()[-1] if " " in name else slug

    candidates = []
    # 尝试常见的用户名格式
    for handle in [slug, slug2]:
        url = f"https://twitter.com/{handle}"
        content = jina_fetch(url, timeout=10)
        if content and "Account suspended" not in content and len(content) > 200:
            candidates.append({
                "type": "twitter",
                "url": url,
                "handle": f"@{handle}",
                "priority": "P1",
                "notes": "Twitter timeline — original tweets only"
            })
            break

    # 搜索确认
    hits = web_search(f"{name} twitter @", num=3)
    for h in hits:
        url = h.get("url", "")
        if "twitter.com/" in url or "x.com/" in url:
            m = re.search(r'(?:twitter|x)\.com/([A-Za-z0-9_]+)', url)
            if m and m.group(1) not in ["search", "home", "i", "explore"]:
                candidates.append({
                    "type": "twitter",
                    "url": url,
                    "handle": f"@{m.group(1)}",
                    "priority": "P1",
                    "notes": "Twitter/X timeline"
                })

    # 去重
    seen = set()
    result = []
    for c in candidates:
        if c["url"] not in seen:
            seen.add(c["url"])
            result.append(c)

    return result[:2]


def discover_youtube(name: str) -> list[dict]:
    """发现 YouTube 频道或作为嘉宾的视频"""
    log(f"Finding YouTube content for {name}...")
    results = []

    try:
        # 搜索 YouTube 频道
        cmd = ["yt-dlp", "--dump-json", "--flat-playlist", f"ytsearch5:{name}", "--quiet"]
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        if out.returncode == 0:
            for line in out.stdout.strip().split("\n"):
                if not line:
                    continue
                try:
                    data = json.loads(line)
                    vid_id = data.get("id", "")
                    title = data.get("title", "")
                    if vid_id:
                        results.append({
                            "type": "youtube",
                            "url": f"https://www.youtube.com/watch?v={vid_id}",
                            "title": title,
                            "priority": "P1",
                            "notes": "YouTube video — extract subtitles/transcript"
                        })
                except json.JSONDecodeError:
                    continue
    except Exception as e:
        log(f"YouTube search failed: {e}")

    return results[:5]


def discover_github(name: str) -> list[dict]:
    """发现 GitHub 个人页"""
    log(f"Searching GitHub for {name}...")
    results = []
    try:
        slug = name.lower().replace(" ", "")
        cmd = ["gh", "search", "users", name, "--limit", "3", "--json", "login,name,bio,htmlUrl"]
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        if out.returncode == 0 and out.stdout.strip():
            users = json.loads(out.stdout)
            for u in users:
                results.append({
                    "type": "github",
                    "url": u.get("htmlUrl", f"https://github.com/{slug}"),
                    "login": u.get("login", ""),
                    "bio": u.get("bio", ""),
                    "priority": "P2",
                    "notes": "GitHub profile, repos, READMEs"
                })
    except Exception as e:
        log(f"GitHub search failed: {e}")

    return results[:2]


def discover_rss(name: str, website_urls: list[str]) -> list[dict]:
    """从已知网站发现 RSS 订阅源"""
    log(f"Looking for RSS feeds...")
    results = []
    common_rss_paths = ["/feed", "/feed.xml", "/rss", "/rss.xml", "/atom.xml", "/index.xml"]

    for base_url in website_urls[:3]:
        base = base_url.rstrip("/")
        for path in common_rss_paths:
            rss_url = base + path
            try:
                import feedparser
                f = feedparser.parse(rss_url)
                if f.entries and len(f.entries) > 0:
                    results.append({
                        "type": "rss",
                        "url": rss_url,
                        "feed_title": f.feed.get("title", ""),
                        "entry_count": len(f.entries),
                        "priority": "P0",
                        "notes": f"RSS feed with {len(f.entries)} entries"
                    })
                    break
            except Exception:
                continue

    return results[:2]


def discover_wechat(name: str, is_chinese: bool = False) -> list[dict]:
    """发现微信公众号（中文人物）"""
    if not is_chinese:
        return []

    log(f"Searching WeChat Official Account for {name}...")
    results = []
    try:
        import asyncio
        from miku_ai import get_wexin_article

        async def search():
            return await get_wexin_article(name, 5)

        articles = asyncio.run(search())
        if articles:
            # 从文章 URL 推断公众号
            seen_accounts = set()
            for a in articles:
                url = a.get("url", "")
                title = a.get("title", "")
                if url and url not in seen_accounts:
                    seen_accounts.add(url)
                    results.append({
                        "type": "wechat",
                        "url": url,
                        "title": title,
                        "priority": "P1",
                        "notes": "WeChat Official Account article"
                    })
    except Exception as e:
        log(f"WeChat search failed: {e}")

    return results[:5]


def discover_linkedin(name: str) -> list[dict]:
    """发现 LinkedIn 公开页面"""
    log(f"Searching LinkedIn for {name}...")
    results = []

    slug = name.lower().replace(" ", "-")
    url = f"https://www.linkedin.com/in/{slug}"

    # Jina 抓取 LinkedIn（公开部分）
    content = jina_fetch(url, timeout=15)
    if content and len(content) > 300 and "Page Not Found" not in content:
        results.append({
            "type": "linkedin",
            "url": url,
            "priority": "P2",
            "notes": "LinkedIn public profile — bio, experience summary"
        })

    return results


def discover_podcasts(name: str) -> list[dict]:
    """搜索播客节目（作为嘉宾或主播）"""
    log(f"Searching podcast appearances for {name}...")
    results = []

    hits = web_search(f"{name} podcast interview transcript", num=5)
    for h in hits:
        url = h.get("url", "")
        if any(domain in url for domain in ["lexfridman.com", "tim.blog", "nav.al",
                                             "ycombinator.com", "a16z.com"]):
            results.append({
                "type": "podcast",
                "url": url,
                "priority": "P1",
                "notes": "Podcast transcript / interview"
            })

    return results[:3]


# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Discover content sources for Soul mining")
    parser.add_argument("name", help="Person's full name")
    parser.add_argument("--known-urls", help="Comma-separated known URLs", default="")
    parser.add_argument("--output", help="Output JSON file", default="sources_discovered.json")
    parser.add_argument("--chinese", action="store_true", help="Include Chinese platform search")
    args = parser.parse_args()

    name = args.name
    known_urls = [u.strip() for u in args.known_urls.split(",") if u.strip()]
    is_chinese = args.chinese

    print(f"\n🔍 Discovering content sources for: {name}")
    print("=" * 50)

    all_sources = []

    # Pre-seed with known URLs
    for url in known_urls:
        all_sources.append({
            "type": "user_provided",
            "url": url,
            "priority": "P0",
            "notes": "User-provided URL"
        })

    # Run discovery
    websites = discover_personal_website(name)
    all_sources.extend(websites)

    twitter = discover_twitter(name)
    all_sources.extend(twitter)

    youtube = discover_youtube(name)
    all_sources.extend(youtube)

    github = discover_github(name)
    all_sources.extend(github)

    linkedin = discover_linkedin(name)
    all_sources.extend(linkedin)

    # RSS from discovered websites
    site_urls = [s["url"] for s in websites] + known_urls
    rss = discover_rss(name, site_urls)
    all_sources.extend(rss)

    podcasts = discover_podcasts(name)
    all_sources.extend(podcasts)

    if is_chinese:
        wechat = discover_wechat(name, is_chinese=True)
        all_sources.extend(wechat)

    # Deduplicate
    seen = set()
    unique_sources = []
    for s in all_sources:
        url = s.get("url", "")
        if url and url not in seen:
            seen.add(url)
            unique_sources.append(s)

    # Count by priority
    p0 = [s for s in unique_sources if s.get("priority") == "P0"]
    p1 = [s for s in unique_sources if s.get("priority") == "P1"]

    output = {
        "person_name": name,
        "discovered_at": datetime.now().isoformat(),
        "total_sources": len(unique_sources),
        "p0_sources": len(p0),
        "p1_sources": len(p1),
        "sources": unique_sources,
        "quality_assessment": "sufficient" if (len(p0) + len(p1)) >= 2 else "insufficient"
    }

    # Save
    out_path = Path(args.output)
    out_path.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"\n✅ Discovery complete:")
    print(f"   Total sources: {len(unique_sources)}")
    print(f"   P0 (first-hand writing): {len(p0)}")
    print(f"   P1 (spoken/video): {len(p1)}")
    print(f"   Quality: {output['quality_assessment']}")
    print(f"\n📄 Saved to: {args.output}")

    if output["quality_assessment"] == "insufficient":
        print("\n⚠️  WARNING: Limited high-quality sources found.")
        print("   Consider providing known URLs with --known-urls")

    return 0 if output["quality_assessment"] == "sufficient" else 1


if __name__ == "__main__":
    sys.exit(main())
