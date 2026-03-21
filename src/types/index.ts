export interface VersionEntry {
  version: string
  date: string
  summary: string
}

export type SoulCategory =
  | 'AI & Engineering'
  | 'Startup & Investing'
  | 'Philosophy & Writing'
  | 'Science & Curiosity'
  | 'Finance & Psychology'

export interface SoulConversation {
  question: string
  answer: string
}

/**
 * SoulMeta — 轻量元数据，存在 _index.json 里
 * 供列表页、搜索、分类筛选使用，不含大字段
 */
export interface SoulMeta {
  id: string
  slug: string
  name: string
  title: string
  category: SoulCategory
  tags: string[]
  description: string
  version: string
  downloads: number
  rating?: number
  reviews?: number
  lastUpdated: string
  isFeatured?: boolean
}

/**
 * Soul — 完整数据，存在 souls/{slug}.json 里
 * 供详情页使用，继承 SoulMeta 所有字段
 */
export interface Soul extends SoulMeta {
  contentSources: string[]
  soulTraits: string[]
  triggerPhrases: string[]
  capabilities: string[]
  filePreview: string
  conversations: SoulConversation[]
  // 完整蒸馏文件内容（完整录入后才有）
  soulMd?: string
  skillMd?: string
  memoryMd?: string
  // 预览片段 fallback（无 bundle 时用）
  skillPreview?: string
  memoryPreview?: string
  // 版本变更记录
  changelog?: VersionEntry[]
}

export interface FAQItem {
  id: string
  question: string
  answer: string
}

export interface WaitlistFormData {
  email: string
  sourceUrl: string
}

export type FormState = 'idle' | 'loading' | 'success' | 'error'
