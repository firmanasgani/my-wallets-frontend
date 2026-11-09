let activeLocks = 0
let previousOverflow = ''

// Keep the document locked when one confirmation replaces or overlays another.
export function lockModalScroll(): () => void {
  if (activeLocks === 0) previousOverflow = document.body.style.overflow
  activeLocks++
  document.body.style.overflow = 'hidden'
  let released = false
  return () => {
    if (released) return
    released = true
    activeLocks = Math.max(0, activeLocks - 1)
    if (activeLocks === 0) document.body.style.overflow = previousOverflow
  }
}
