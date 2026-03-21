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

/** Persona skill: souls/{slug}/skills/{slug}/SKILL.md */
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

for (const [path, raw] of Object.entries(personaSkillGlob)) {
  const parsed = parsePersonaSkillPath(path)
  if (!parsed || parsed.skillFolder !== parsed.soulSlug) continue
  bySlug[parsed.soulSlug] = { ...bySlug[parsed.soulSlug], skillMd: raw }
}

export function getBundledSoulPackage(slug: string): {
  soulMd?: string
  memoryMd?: string
  skillMd?: string
  readmeMd?: string
} {
  return bySlug[slug] ?? {}
}
