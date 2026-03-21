import JSZip from 'jszip'
import type { Soul } from '../types'

// ── Fallback generators (used when real distilled files aren't available) ──

function buildFallbackSoulMd(soul: Soul): string {
  return `# ${soul.name} · Soul

> Distilled by Vessel · vessel.ai

---

## Identity

${soul.filePreview.replace(/^# .*\n/m, '').trim()}

---

## Core Traits

${soul.soulTraits.map((t) => `- ${t}`).join('\n')}

---

## What I Refuse

- I will not fabricate positions I've never held.
- I will not pretend to have knowledge I don't have.
- I will not soften a position to be polite when directness is more useful.

---

*Sources: ${soul.contentSources.join(', ')}*
*Version ${soul.version} · Distilled by Vessel · vessel.ai · ${new Date().getFullYear()}*
`
}

function buildFallbackSkillMd(soul: Soul): string {
  const firstName = soul.name.split(' ')[0]
  return `# ${soul.name} · Skill

> How to deploy this Soul effectively.
> *Distilled by Vessel · vessel.ai*

---

## Best At

${soul.capabilities.map((c, i) => `${i + 1}. **${c}**`).join('\n')}

---

## Trigger Phrases

${soul.triggerPhrases.map((p) => `- ${p}`).join('\n')}

---

## Installation

### Cursor
\`\`\`
.cursor/rules/${soul.slug}.md  ← paste SOUL.md content here
\`\`\`

### Claude / Claude Code
\`\`\`
CLAUDE.md  ← paste SOUL.md content here
\`\`\`

### Any AI tool
Copy the full contents of \`SOUL.md\` as the system prompt.

---

*Version ${soul.version} · Distilled by Vessel · vessel.ai · ${new Date().getFullYear()}*
*Built from public content. No affiliation with ${firstName}.*
`
}

function buildFallbackMemoryMd(soul: Soul): string {
  const convExamples = soul.conversations
    .map(
      (c, i) =>
        `### Example ${i + 1}\n\n**Q:** ${c.question}\n\n**${soul.name.split(' ')[0]}:** ${c.answer}`
    )
    .join('\n\n---\n\n')

  return `# ${soul.name} · Memory

> The intellectual arsenal — arguments, frameworks, and positions.
> *Distilled by Vessel · vessel.ai*

---

## Core Traits & Arguments

${soul.soulTraits.map((t) => `- ${t}`).join('\n')}

---

## Domain & Tags

**Category:** ${soul.category}
**Tags:** ${soul.tags.join(', ')}

---

## Sample Responses

${convExamples}

---

## Sources

${soul.contentSources.map((s) => `- ${s}`).join('\n')}

---

## What This Soul Doesn't Know

- Events and developments after the source material cutoff date
- Topics outside the domains represented in source material
- Private views not expressed publicly

---

*Version ${soul.version} · Distilled by Vessel · vessel.ai · ${new Date().getFullYear()}*
`
}

function buildReadme(soul: Soul): string {
  return `# ${soul.name} — Vessel Soul Package

This Soul was distilled by [Vessel](https://vessel.ai) from public content only.

## Files

| File | Purpose | Load as |
|------|---------|---------|
| \`SOUL.md\` | Identity — who they are, how they think, how they communicate | System prompt |
| \`SKILL.md\` | Capabilities — what they do best, trigger phrases, installation guide | Reference |
| \`MEMORY.md\` | Knowledge base — arguments, frameworks, positions, case studies | Context |

## Quick Start

Paste \`SOUL.md\` as your AI system prompt:

\`\`\`
# Cursor
.cursor/rules/${soul.slug}.md

# Claude
CLAUDE.md

# Any AI
System prompt field
\`\`\`

## Vessel CLI (coming soon)

\`\`\`bash
vessel install ${soul.slug}
\`\`\`

## Sources

${soul.contentSources.map((s) => `- ${s}`).join('\n')}

---

*Built from public content only. No affiliation with ${soul.name}.*
*Distilled by Vessel · vessel.ai · ${new Date().getFullYear()}*
`
}

// ── Main download function ──

export async function downloadSoulZip(soul: Soul): Promise<void> {
  const zip = new JSZip()
  const folder = zip.folder(soul.slug)
  if (!folder) return

  // Use real distilled files if available, otherwise generate from Soul data
  const soulMdContent = soul.soulMd ?? buildFallbackSoulMd(soul)
  const skillMdContent = soul.skillMd ?? buildFallbackSkillMd(soul)
  const memoryMdContent = soul.memoryMd ?? buildFallbackMemoryMd(soul)

  folder.file('SOUL.md', soulMdContent)
  folder.file('SKILL.md', skillMdContent)
  folder.file('MEMORY.md', memoryMdContent)
  folder.file('README.md', buildReadme(soul))

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${soul.slug}-soul-vessel.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
