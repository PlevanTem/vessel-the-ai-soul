#!/usr/bin/env node
/**
 * Soul / 前端目录完整性校验
 * - 解析 vessel/src/data/souls/*.json
 * - slug、id 与文件名一致
 * - 对应 vessel/souls/{slug}/SOUL.md 存在
 * - 孤儿目录（无 JSON）告警
 * 可选：检测仓库根目录重复副本与 vessel 的 slug 集合是否一致
 *
 * 用法：在仓库根目录执行  node scripts/verify-soul-integrity.mjs
 * 选项：--strict  若有 WARN 则 exit 1
 *       --no-drift-check  跳过根目录 src/souls 与 vessel 的对比
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')

const args = new Set(process.argv.slice(2))
const STRICT = args.has('--strict')
const NO_DRIFT = args.has('--no-drift-check')

function resolveAppRoot() {
  const vesselPkg = path.join(REPO_ROOT, 'vessel', 'package.json')
  if (fs.existsSync(vesselPkg)) {
    return path.join(REPO_ROOT, 'vessel')
  }
  return REPO_ROOT
}

const APP_ROOT = resolveAppRoot()
const JSON_DIR = path.join(APP_ROOT, 'src', 'data', 'souls')
const SOULS_MD_ROOT = path.join(APP_ROOT, 'souls')

const errors = []
const warnings = []

function err(msg) {
  errors.push(msg)
  console.error(`[ERROR] ${msg}`)
}

function warn(msg) {
  warnings.push(msg)
  console.warn(`[WARN] ${msg}`)
}

function readJsonSlugs() {
  if (!fs.existsSync(JSON_DIR)) {
    err(`缺少目录: ${JSON_DIR}`)
    return { files: [], bySlug: new Map() }
  }

  const files = fs.readdirSync(JSON_DIR).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  const bySlug = new Map()

  for (const file of files) {
    const full = path.join(JSON_DIR, file)
    let data
    try {
      data = JSON.parse(fs.readFileSync(full, 'utf8'))
    } catch (e) {
      err(`${file}: JSON 解析失败 — ${e.message}`)
      continue
    }

    const stem = path.basename(file, '.json')
    const slug = data.slug
    const id = data.id

    if (slug !== stem) {
      err(`${file}: slug 字段 "${slug}" 与文件名 "${stem}" 不一致`)
    }
    if (id != null && id !== slug) {
      err(`${file}: id "${id}" 与 slug "${slug}" 不一致`)
    }
    if (!slug || typeof slug !== 'string') {
      err(`${file}: 缺少有效 slug 字段`)
      continue
    }

    bySlug.set(slug, { file, full })
  }

  return { files, bySlug }
}

function checkMarkdownPackages(bySlug) {
  if (!fs.existsSync(SOULS_MD_ROOT)) {
    warn(`缺少 Markdown Soul 根目录: ${SOULS_MD_ROOT}`)
    return
  }

  for (const slug of bySlug.keys()) {
    const soulMd = path.join(SOULS_MD_ROOT, slug, 'SOUL.md')
    if (!fs.existsSync(soulMd)) {
      warn(`JSON 已注册 slug "${slug}"，但未找到 ${path.relative(REPO_ROOT, soulMd)}`)
    }
  }

  const dirs = fs
    .readdirSync(SOULS_MD_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  for (const dir of dirs) {
    if (dir.startsWith('_') || dir.startsWith('.')) continue
    if (!bySlug.has(dir)) {
      warn(`目录 souls/${dir}/ 存在，但无对应 src/data/souls/${dir}.json（孤儿目录或待补 JSON）`)
    }
  }
}

function checkCriticalAppFiles() {
  const must = [
    path.join(APP_ROOT, 'package.json'),
    path.join(APP_ROOT, 'vite.config.ts'),
    path.join(APP_ROOT, 'index.html'),
    path.join(APP_ROOT, 'src', 'data', 'souls.ts'),
    path.join(APP_ROOT, 'src', 'utils', 'bundledSouls.ts'),
  ]
  for (const p of must) {
    if (!fs.existsSync(p)) {
      err(`缺少核心文件: ${path.relative(REPO_ROOT, p)}`)
    }
  }
}

function driftCheck(vesselSlugs) {
  if (NO_DRIFT) return

  const rootSouls = path.join(REPO_ROOT, 'souls')
  const rootSrcSouls = path.join(REPO_ROOT, 'src', 'data', 'souls')

  const hasRootDup =
    fs.existsSync(rootSouls) &&
    fs.existsSync(rootSrcSouls) &&
    APP_ROOT !== REPO_ROOT &&
    path.resolve(APP_ROOT) === path.join(REPO_ROOT, 'vessel')

  if (!hasRootDup) return

  const readSlugs = (dir) => {
    if (!fs.existsSync(dir)) return new Set()
    return new Set(
      fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
        .map((f) => path.basename(f, '.json')),
    )
  }

  const rootJsonSlugs = readSlugs(rootSrcSouls)
  if (rootJsonSlugs.size === 0) return

  const onlyVessel = [...vesselSlugs].filter((s) => !rootJsonSlugs.has(s))
  const onlyRoot = [...rootJsonSlugs].filter((s) => !vesselSlugs.has(s))

  if (onlyVessel.length || onlyRoot.length) {
    warn(
      `根目录存在重复的 src/data/souls/，与 vessel 的 slug 集合不一致。` +
        `仅 vessel 为权威来源；请合并或删除根目录副本避免混乱。` +
        (onlyVessel.length ? ` 仅在 vessel: ${onlyVessel.join(', ')}.` : '') +
        (onlyRoot.length ? ` 仅在根目录: ${onlyRoot.join(', ')}.` : ''),
    )
  }
}

function main() {
  console.log(`APP_ROOT = ${path.relative(REPO_ROOT, APP_ROOT) || '.'}`)
  checkCriticalAppFiles()

  const { bySlug } = readJsonSlugs()
  checkMarkdownPackages(bySlug)
  driftCheck(new Set(bySlug.keys()))

  const hasErrors = errors.length > 0
  const hasWarnings = warnings.length > 0

  console.log('')
  if (!hasErrors && !hasWarnings) {
    console.log(`OK — 已检查 ${bySlug.size} 个 Soul JSON，核心路径与 Markdown 关联正常。`)
    process.exit(0)
  }

  if (!hasErrors && hasWarnings) {
    console.log(`完成：${warnings.length} 条警告（${STRICT ? 'strict 模式下失败' : '未视为失败'}）。`)
    process.exit(STRICT ? 1 : 0)
  }

  console.log(`失败：${errors.length} 个错误。`)
  process.exit(1)
}

main()
