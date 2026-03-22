/**
 * Bundles distilled markdown from ../../souls/{slug}/ at build time (Vite ?raw).
 * When present, downloadSoulZip prefers these over JSON-embedded or fallback stubs.
 */

const soulMdGlob = import.meta.glob('../../souls/*/SOUL.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const memoryMdGlob = import.meta.glob('../../souls/*/MEMORY.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const readmeMdGlob = import.meta.glob('../../souls/*/README.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

/** Every skill: souls/{slug}/skills/{folder}/SKILL.md */
const personaSkillGlob = import.meta.glob('../../souls/*/skills/*/SKILL.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function slugFromSoulPath(path: string): string | undefined {
  const m = path.match(/souls\/([^/]+)\/SOUL\.md$/)
  return m?.[1]
}

function slugFromMemoryPath(path: string): string | undefined {
  const m = path.match(/souls\/([^/]+)\/MEMORY\.md$/)
  return m?.[1]
}

function slugFromReadmePath(path: string): string | undefined {
  const m = path.match(/souls\/([^/]+)\/README\.md$/)
  return m?.[1]
}

function parsePersonaSkillPath(path: string): { soulSlug: string; skillFolder: string } | null {
  const m = path.match(/souls\/([^/]+)\/skills\/([^/]+)\/SKILL\.md$/)
  if (!m) return null
  return { soulSlug: m[1], skillFolder: m[2] }
}

const bySlug: Record<
  string,
  { soulMd?: string; memoryMd?: string; skillMd?: string; readmeMd?: string }
> = {}

for (const [path, raw] of Object.entries(soulMdGlob)) {
  const slug = slugFromSoulPath(path)
  if (!slug) continue
  bySlug[slug] = { ...bySlug[slug], soulMd: raw }
}

for (const [path, raw] of Object.entries(memoryMdGlob)) {
  const slug = slugFromMemoryPath(path)
  if (!slug) continue
  bySlug[slug] = { ...bySlug[slug], memoryMd: raw }
}

for (const [path, raw] of Object.entries(readmeMdGlob)) {
  const slug = slugFromReadmePath(path)
  if (!slug) continue
  bySlug[slug] = { ...bySlug[slug], readmeMd: raw }
}

/** All skills under vessel/souls/{slug}/skills/{folder}/SKILL.md (sorted: main persona folder first, then A–Z). */
const skillsBySoulSlug: Record<string, { folder: string; content: string }[]> = {}

function sortSoulSkills(soulSlug: string, skills: { folder: string; content: string }[]) {
  return [...skills].sort((a, b) => {
    const aMain = a.folder === soulSlug ? 0 : 1
    const bMain = b.folder === soulSlug ? 0 : 1
    if (aMain !== bMain) return aMain - bMain
    return a.folder.localeCompare(b.folder)
  })
}

for (const [path, raw] of Object.entries(personaSkillGlob)) {
  const parsed = parsePersonaSkillPath(path)
  if (!parsed) continue
  const list = skillsBySoulSlug[parsed.soulSlug] ?? []
  list.push({ folder: parsed.skillFolder, content: raw })
  skillsBySoulSlug[parsed.soulSlug] = list
}

for (const soulSlug of Object.keys(skillsBySoulSlug)) {
  const sorted = sortSoulSkills(soulSlug, skillsBySoulSlug[soulSlug]!)
  skillsBySoulSlug[soulSlug] = sorted
  const main = sorted.find((s) => s.folder === soulSlug)
  const primary = main?.content ?? sorted[0]?.content
  if (primary) {
    bySlug[soulSlug] = { ...bySlug[soulSlug], skillMd: primary }
  }
}

export function getBundledSoulSkills(slug: string): { folder: string; content: string }[] {
  return skillsBySoulSlug[slug] ?? []
}

export function getBundledSoulPackage(slug: string): {
  soulMd?: string
  memoryMd?: string
  skillMd?: string
  readmeMd?: string
} {
  return bySlug[slug] ?? {}
}
