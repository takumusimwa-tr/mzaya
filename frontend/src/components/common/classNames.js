/**
 * MZAYA shared class-name composer.
 * Ignores false, null and undefined values while preserving plain strings.
 */
export function classNames(...values) {
  return values.filter(Boolean).join(' ')
}
