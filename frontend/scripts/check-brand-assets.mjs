import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const logoDirectory = resolve(import.meta.dirname, '../src/assets/brand/logos')
const svgFiles = readdirSync(logoDirectory).filter((name) => name.endsWith('.svg'))
const failures = []

for (const file of svgFiles) {
  const content = readFileSync(join(logoDirectory, file), 'utf8')
  const problems = []
  if (/<text(?:\s|>)/i.test(content)) problems.push('contains live SVG text (not the approved vector wordmark)')
  if (/#(?:00A651|34C76F|007D3D)\b/i.test(content)) problems.push('contains legacy bright-green colors')
  if (/Comic Sans|Segoe Script/i.test(content)) problems.push('contains substitute lettering')
  if (problems.length) failures.push({ file, problems })
}

if (failures.length) {
  console.error('Mzaya brand asset integrity check FAILED:')
  for (const { file, problems } of failures) {
    console.error(' - ' + file + ': ' + problems.join('; '))
  }
  console.error('Replace affected assets with approved, exported vector masters. Do not auto-recolor or trace them.')
  process.exitCode = 1
} else {
  console.log('Mzaya brand asset integrity check passed (' + svgFiles.length + ' SVG files inspected).')
}
