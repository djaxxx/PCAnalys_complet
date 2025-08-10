import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  const classString = clsx(...inputs)
  const deduped = Array.from(new Set(classString.split(/\s+/).filter(Boolean))).join(' ')
  return twMerge(deduped)
}
