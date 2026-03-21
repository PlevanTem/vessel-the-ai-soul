/**
 * Soul Data Layer — Zero-Config Edition
 *
 * ┌─────────────────────────────────────────────────────┐
 * │  新增 Soul：在 souls/ 目录下放一个 {slug}.json       │
 * │  修改 Soul：直接编辑对应的 {slug}.json               │
 * │  删除 Soul：删掉对应的 {slug}.json                   │
 * │                                                     │
 * │  不需要改任何代码，不需要改任何注册表。               │
 * └─────────────────────────────────────────────────────┘
 *
 * 排序规则：先看 soul JSON 里的 displayOrder 字段（数字越小越靠前），
 *           没有该字段的按 downloads 降序排。
 *           featured 标记不影响顺序，只影响展示样式。
 */

import type { Soul } from '../types'

// Vite glob import — 自动扫描 souls/ 目录下所有 JSON（排除 _ 开头的文件）
// eager: true 表示同步加载，构建时 tree-shake，不影响性能
const modules = import.meta.glob('./souls/[!_]*.json', {
  eager: true,
}) as Record<string, { default: Soul }>

// 解析并排序
function buildSouls(): Soul[] {
  return Object.values(modules)
    .map((m) => m.default)
    .sort((a, b) => {
      const oa = (a as Soul & { displayOrder?: number }).displayOrder ?? 999
      const ob = (b as Soul & { displayOrder?: number }).displayOrder ?? 999
      if (oa !== ob) return oa - ob
      return (b.downloads ?? 0) - (a.downloads ?? 0)
    })
}

// ─── 公共导出 ──────────────────────────────────────────────────────────────────

/** 全部 Soul 列表（已排序） */
export const souls: Soul[] = buildSouls()

/** 轻量元数据索引（兼容旧代码，实际与 souls 相同） */
export const soulIndex = souls

/** 按 slug 获取单个 Soul */
export function getSoulBySlug(slug: string): Soul | undefined {
  return souls.find((s) => s.slug === slug)
}

/** 全部 Soul（与 souls 相同，保持旧接口兼容） */
export function getAllSouls(): Soul[] {
  return souls
}

/** 分类列表 — 从 Soul 数据自动推导，无需手动维护 */
export const categories: string[] = [
  'All',
  ...Array.from(new Set(souls.map((s) => s.category))).sort(),
]
