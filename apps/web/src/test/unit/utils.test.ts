import { describe, it, expect } from 'vitest'
import { cn } from '../../../lib/utils'

describe('cn()', () => {
  it('merges class names and removes duplicates', () => {
    expect(cn('btn', 'btn', 'primary')).toBe('btn primary')
  })

  it('handles conditional classes', () => {
    const active = true
    const disabled = false
    expect(cn('btn', active && 'active', disabled && 'disabled')).toBe('btn active')
  })
})
