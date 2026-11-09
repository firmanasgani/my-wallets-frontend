import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useAnalysisChartTheme() {
  const theme = ref({ ink: '#27231d', muted: '#6c6256', rule: '#e2d8c7', surface: '#fffcf5', income: '#48715c', expense: '#7955ae', net: '#96712e', reducedMotion: false })
  let observer: MutationObserver | undefined
  let motion: MediaQueryList | undefined
  const sync = () => {
    const shell = document.querySelector('.money-shell') || document.documentElement
    const css = getComputedStyle(shell)
    const color = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
    const dark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark')
    theme.value = { ink: color('--shell-ink', '#27231d'), muted: color('--shell-muted', '#6c6256'), rule: color('--shell-rule', '#e2d8c7'), surface: color('--shell-surface', '#fffcf5'), income: dark ? '#93c4a8' : '#48715c', expense: dark ? '#cfb8f5' : '#7955ae', net: dark ? '#dec089' : '#96712e', reducedMotion: motion?.matches || false }
  }
  onMounted(() => {
    motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    motion.addEventListener('change', sync)
    observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] })
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] })
    sync()
  })
  onBeforeUnmount(() => { observer?.disconnect(); motion?.removeEventListener('change', sync) })
  return theme
}
