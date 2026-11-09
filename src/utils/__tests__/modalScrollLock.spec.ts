import { afterEach, describe, expect, it } from 'vitest'
import { lockModalScroll } from '../modalScrollLock'

describe('confirmation modal scroll lock', () => {
  const releases: (() => void)[] = []
  afterEach(() => { releases.forEach((release) => release()); releases.length = 0; document.body.style.overflow = '' })

  it('restores the original overflow value when the modal closes', () => {
    document.body.style.overflow = 'auto'
    const release = lockModalScroll()
    releases.push(release)
    expect(document.body.style.overflow).toBe('hidden')
    release()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('keeps scrolling locked until every stacked confirmation is closed', () => {
    document.body.style.overflow = 'scroll'
    const first = lockModalScroll()
    const second = lockModalScroll()
    releases.push(first, second)
    first()
    expect(document.body.style.overflow).toBe('hidden')
    first() // A repeated cleanup must not release another modal's lock.
    expect(document.body.style.overflow).toBe('hidden')
    second()
    expect(document.body.style.overflow).toBe('scroll')
  })
})
