import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const logoDirectory = resolve(import.meta.dirname, '../src/assets/brand/logos')
const svgFiles = readdirSync(logoDirectory).filter((name) => name.endsWith('.svg'))
const failures = []
for (const file of svgFiles) {
  const content = readFileSync(join(logoDirectory, file), 'utf8')
  const problems = []
  if (/<text(?:\s|>)/i.test(content)) problems.push('contains live SVG text')
  if (/#(?:00A651|34C76F|007D3D)\b/i.test(content)) problems.push('contains legacy bright green')
  if (/Comic Sans|Segoe Script/i.test(content)) problems.push('contains substitute lettering')
  if (problems.length) failures.push(`${file}: ${problems.join('; ')}`)
}
if (failures.length) {
  console.error('Brand check failed:\n' + failures.join('\n'))
  process.exitCode = 1
} else console.log(`Brand check passed (${svgFiles.length} SVGs).`)
