import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  // Build class string with clsx (spread inputs), then remove exact duplicates before tailwind merge
  const classString = clsx(...inputs)
  const deduped = Array.from(new Set(classString.split(/\s+/).filter(Boolean))).join(' ')
  return twMerge(deduped)
}
