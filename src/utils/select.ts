import type { SelectOption, SelectValue } from '@/types/select'

export function filterSelectOptions<T extends SelectValue>(options: readonly SelectOption<T>[], query: string) {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase()
  const search = normalize(query.trim())
  return search ? options.filter((option) => normalize(`${option.label} ${option.group || ''} ${option.description || ''}`).includes(search)) : [...options]
}

export function nextSelectIndex<T extends SelectValue>(options: readonly SelectOption<T>[], current: number, direction: 1 | -1) {
  if (!options.length) return -1
  let index = current
  for (let count = 0; count < options.length; count++) {
    index = (index + direction + options.length) % options.length
    if (!options[index]?.disabled) return index
  }
  return -1
}
