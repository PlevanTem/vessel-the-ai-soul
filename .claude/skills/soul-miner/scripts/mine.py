#!/usr/bin/env python3
"""
Soul Miner — Phase 2: Content Mining
读取 sources_discovered.json，批量抓取内容，输出 raw_content.json。
"""

import sys
import json
import re
import subprocess
import argparse
from pathlib import Path
from datetime import datetime
from typing import Optional


# ──────────────────────────────────────────────
# Utilities
# ──────────────────────────────────────────────

def log(msg: str, indent: int = 2):
    prefix = " " * indent + "·"
    print(f"{prefix} {msg}", flush=True)


def jina_fetch(url: str, timeout: int = 25) -> Optional[str]:
    """用 Jina Reader 抓取任意网页"""
    try:
        result = subprocess.run(
            ["curl", "-s", "--max-time", str(timeout),
             "-H", "Accept: text/plain",
             f"https://r.jina.ai/{url}"],
            capture_output=True, text=True, timeout=timeout + 5
        )
        content = result.stdout.strip()
        if len(content) < 100:
            return None
        return content
    except Exception as e:
        log(f"Jina fetch error for {url}: {e}")
        return None


def truncate(text: str, max_chars: int = 8000) -> str:
    """截断文本，保留前 max_chars 字符"""
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + f"\n\n[... truncated at {max_chars} chars ...]"


# ──────────────────────────────────────────────
# Per-source Miners
# ──────────────────────────────────────────────

def mine_website(source: dict) -> Optional[dict]:
    """抓取个人网站/博客"""
    url = source["url"]
    log(f"Mining website: {url}")

    content = jina_fetch(url)
    if not content:
        log(f"Failed to fetch {url}")
        return None

    # 尝试提取文章列表并抓取前几篇
    article_links = re.findall(
        r'https?://[^\s"<>]+(?:essay|post|article|blog|writing)[^\s"<>]*',
        content
    )
    # 也从链接中提取
    all_links = re.findall(r'href=["\']([^"\']+)["\']', content)
    base_domain = re.match(r'https?://[^/]+', url)
    base = base_domain.group(0) if base_domain else ""

    articles_fetched = []
    for link in (article_links + all_links)[:20]:
        if not link.startswith("http"):
            link = base + "/" + link.lstrip("/")
        if link == url:
            continue
        article_content = jina_fetch(link, timeout=15)
        if article_content and len(article_content) > 500:
            articles_fetched.append({
                "url": link,
                "content": truncate(article_content, 5000)
            })
        if len(articles_fetched) >= 8:
            break

    return {
        "source_type": "website",
        "url": url,
        "homepage_content": truncate(content, 3000),
        "articles": articles_fetched,
        "total_chars": sum(len(a["content"]) for a in articles_fetched),
        "mined_at": datetime.now().isoformat()
    }


def mine_twitter(source: dict) -> Optional[dict]:
    """抓取 Twitter/X 内容"""
    url = source["url"]
    handle = source.get("handle", "")
    log(f"Mining Twitter: {handle or url}")

    tweets = []

    # 方法1: xreach（如果可用）
    username = handle.lstrip("@") if handle else re.search(r'twitter\.com/([^/]+)', url)
    if isinstance(username, re.Match):
        username = username.group(1)

    if username:
        try:
            result = subprocess.run(
                ["xreach", "tweets", f"@{username}", "-n", "50", "--json"],
                capture_output=True, text=True, timeout=30
            )
            if result.returncode == 0 and result.stdout.strip():
                data = json.loads(result.stdout)
                raw_tweets = data if isinstance(data, list) else data.get("tweets", [])
                for t in raw_tweets[:50]:
                    text = t.get("text") or t.get("full_text") or ""
                    # 过滤转推
                    if text and not text.startswith("RT @"):
                        tweets.append({
                            "text": text,
                            "date": t.get("created_at", ""),
                            "likes": t.get("favorite_count", 0)
                        })
        except (FileNotFoundError, json.JSONDecodeError, subprocess.TimeoutExpired):
            pass

    # 方法2: Jina fallback
    if not tweets:
        content = jina_fetch(url, timeout=20)
        if content:
            # 提取推文文本（简单启发式）
            lines = [l.strip() for l in content.split("\n") if len(l.strip()) > 30]
            for line in lines[:100]:
                if not line.startswith("http") and not line.startswith("@"):
                    tweets.append({"text": line, "date": "", "likes": 0})

    if not tweets:
        return None

    # 按 likes 排序，取前 30
    tweets_sorted = sorted(tweets, key=lambda x: x.get("likes", 0), reverse=True)

    return {
        "source_type": "twitter",
        "url": url,
        "handle": handle,
        "tweets_count": len(tweets_sorted),
        "tweets": tweets_sorted[:30],
        "mined_at": datetime.now().isoformat()
    }


def mine_youtube(source: dict) -> Optional[dict]:
    """提取 YouTube 视频字幕"""
    url = source["url"]
    title = source.get("title", "")
    log(f"Mining YouTube: {title or url}")

    vid_id_match = re.search(r'[?&]v=([A-Za-z0-9_-]+)', url)
    if not vid_id_match:
        return None

    vid_id = vid_id_match.group(1)
    tmp_dir = Path("/tmp") / f"yt_{vid_id}"
    tmp_dir.mkdir(exist_ok=True)

    try:
        # 下载字幕
        cmd = [
            "yt-dlp", "--write-sub", "--write-auto-sub",
            "--sub-lang", "en,zh-Hans,zh",
            "--skip-download", "--quiet",
            "-o", str(tmp_dir / "%(id)s"),
            url
        ]
        subprocess.run(cmd, capture_output=True, timeout=30)

        # 读取字幕文件
        transcript = ""
        for ext in ["en.vtt", "en.srt", "zh-Hans.vtt", "zh.vtt"]:
            sub_file = tmp_dir / f"{vid_id}.{ext}"
            if sub_file.exists():
                raw = sub_file.read_text(encoding="utf-8")
                # 清理 VTT 格式
                lines = []
                for line in raw.split("\n"):
                    line = line.strip()
                    if (line and
                            not line.startswith("WEBVTT") and
                            not re.match(r'^\d+$', line) and
                            not re.match(r'^\d{2}:\d{2}', line) and
                            not re.match(r'^<\d', line)):
                        # 去除 HTML 标签
                        clean = re.sub(r'<[^>]+>', '', line)
                        if clean:
                            lines.append(clean)
                transcript = " ".join(lines)
                break

        if not transcript:
            # 只取元数据
            meta_cmd = ["yt-dlp", "--dump-json", url, "--quiet"]
            meta_out = subprocess.run(meta_cmd, capture_output=True, text=True, timeout=15)
            if meta_out.returncode == 0:
                meta = json.loads(meta_out.stdout)
                transcript = meta.get("description", "")
                title = meta.get("title", title)

        if not transcript:
            return None

        return {
            "source_type": "youtube",
            "url": url,
            "video_id": vid_id,
            "title": title,
            "transcript": truncate(transcript, 6000),
            "mined_at": datetime.now().isoformat()
        }

    except Exception as e:
        log(f"YouTube mining error: {e}")
        return None


def mine_rss(source: dict) -> Optional[dict]:
    """提取 RSS 订阅源内容"""
    url = source["url"]
    log(f"Mining RSS: {url}")

    try:
        import feedparser
        feed = feedparser.parse(url)
        if not feed.entries:
            return None

        articles = []
        for entry in feed.entries[:20]:
            article_url = entry.get("link", "")
            article_title = entry.get("title", "")

            # 先尝试 summary
            content = entry.get("summary", "") or entry.get("content", [{}])[0].get("value", "")

            # 如果 summary 太短，用 Jina 抓全文
            if len(content) < 500 and article_url:
                full = jina_fetch(article_url, timeout=15)
                if full:
                    content = full

            if content and len(content) > 200:
                articles.append({
                    "url": article_url,
                    "title": article_title,
                    "date": str(entry.get("published", "")),
                    "content": truncate(content, 5000)
                })

        if not articles:
            return None

        return {
            "source_type": "rss",
            "url": url,
            "feed_title": feed.feed.get("title", ""),
            "articles": articles,
            "total_chars": sum(len(a["content"]) for a in articles),
            "mined_at": datetime.now().isoformat()
        }

    except Exception as e:
        log(f"RSS mining error: {e}")
        return None


def mine_github(source: dict) -> Optional[dict]:
    """提取 GitHub 个人页和 README"""
    url = source["url"]
    log(f"Mining GitHub: {url}")

    login = source.get("login") or re.search(r'github\.com/([^/]+)', url)
    if isinstance(login, re.Match):
        login = login.group(1)

    if not login:
        return None

    result_data = {"source_type": "github", "url": url, "login": login}

    # 抓取个人 README
    readme_url = f"https://raw.githubusercontent.com/{login}/{login}/main/README.md"
    readme = jina_fetch(readme_url, timeout=10)
    if readme and "404" not in readme[:50]:
        result_data["profile_readme"] = truncate(readme, 3000)

    # 用 gh CLI 获取 bio 和热门 repos
    try:
        cmd = ["gh", "api", f"users/{login}"]
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if out.returncode == 0:
            user_data = json.loads(out.stdout)
            result_data["bio"] = user_data.get("bio", "")
            result_data["company"] = user_data.get("company", "")
            result_data["blog"] = user_data.get("blog", "")
    except Exception:
        pass

    # 获取热门 Repo 的 README
    try:
        cmd = ["gh", "search", "repos", f"user:{login}", "--sort", "stars", "--limit", "3",
               "--json", "name,description,url"]
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if out.returncode == 0 and out.stdout.strip():
            repos = json.loads(out.stdout)
            result_data["repos"] = repos
    except Exception:
        pass

    if "profile_readme" not in result_data and "bio" not in result_data:
        return None

    result_data["mined_at"] = datetime.now().isoformat()
    return result_data


def mine_generic(source: dict) -> Optional[dict]:
    """通用网页抓取（podcast, linkedin, user_provided 等）"""
    url = source["url"]
    source_type = source.get("type", "generic")
    log(f"Mining {source_type}: {url}")

    content = jina_fetch(url, timeout=20)
    if not content or len(content) < 200:
        return None

    return {
        "source_type": source_type,
        "url": url,
        "content": truncate(content, 6000),
        "mined_at": datetime.now().isoformat()
    }


# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────

MINERS = {
    "website": mine_website,
    "rss": mine_rss,
    "twitter": mine_twitter,
    "youtube": mine_youtube,
    "github": mine_github,
    "podcast": mine_generic,
    "linkedin": mine_generic,
    "user_provided": mine_generic,
    "wechat": mine_generic,
}


def main():
    parser = argparse.ArgumentParser(description="Mine content from discovered sources")
    parser.add_argument("sources_file", help="Path to sources_discovered.json")
    parser.add_argument("--output", default="raw_content.json", help="Output file")
    parser.add_argument("--max-sources", type=int, default=20, help="Max sources to mine")
    args = parser.parse_args()

    sources_path = Path(args.sources_file)
    if not sources_path.exists():
        print(f"Error: {args.sources_file} not found")
        sys.exit(1)

    discovery = json.loads(sources_path.read_text(encoding="utf-8"))
    person_name = discovery.get("person_name", "Unknown")
    sources = discovery.get("sources", [])

    print(f"\n⛏  Mining content for: {person_name}")
    print(f"   Sources to process: {min(len(sources), args.max_sources)}")
    print("=" * 50)

    mined = []
    errors = []
    total_chars = 0

    for i, source in enumerate(sources[:args.max_sources]):
        source_type = source.get("type", "generic")
        miner = MINERS.get(source_type, mine_generic)

        try:
            result = miner(source)
            if result:
                mined.append(result)
                chars = result.get("total_chars", len(result.get("content", "")))
                total_chars += chars
                print(f"  ✓ [{i+1}/{len(sources)}] {source_type}: {source['url'][:60]}")
            else:
                errors.append({"url": source.get("url"), "error": "no content extracted"})
                print(f"  ✗ [{i+1}/{len(sources)}] {source_type}: empty result")
        except Exception as e:
            errors.append({"url": source.get("url"), "error": str(e)})
            print(f"  ✗ [{i+1}/{len(sources)}] {source_type}: {e}")

    output = {
        "person_name": person_name,
        "mined_at": datetime.now().isoformat(),
        "total_sources_attempted": len(sources[:args.max_sources]),
        "total_sources_succeeded": len(mined),
        "total_chars_extracted": total_chars,
        "estimated_words": total_chars // 5,
        "sources_mined": mined,
        "errors": errors
    }

    out_path = Path(args.output)
    out_path.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"\n✅ Mining complete:")
    print(f"   Succeeded: {len(mined)} / {len(sources[:args.max_sources])}")
    print(f"   Total words (est.): {total_chars // 5:,}")
    print(f"   Output: {args.output}")

    if total_chars // 5 < 3000:
        print("\n⚠️  WARNING: Limited content extracted (<3000 words).")
        print("   Consider adding more known URLs to the discovery phase.")

    # Also save errors log
    if errors:
        err_path = Path("mine_errors.log")
        err_path.write_text(
            "\n".join(f"{e['url']}: {e['error']}" for e in errors),
            encoding="utf-8"
        )


if __name__ == "__main__":
    main()
